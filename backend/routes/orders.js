import express from 'express';
import pool from '../config/db.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { ensureCompanyId } from '../middleware/companyMiddleware.js';
import { asyncHandler } from '../utils/errorHandler.js';
import { logActivity } from '../middleware/logger.js';
import { createNotification } from './notifications.js';
import crypto from 'crypto';

const router = express.Router();

// PUBLIC ROUTES - Quote viewing and signing by client

// GET /api/public/quote/:quoteLink - Public view for client
router.get('/public/quote/:quoteLink', asyncHandler(async (req, res) => {
    const { quoteLink } = req.params;

    // Get order with quote stage
    const [orders] = await pool.query(
      `SELECT
        o.id,
        o.order_number,
        o.client_name,
        o.client_email,
        o.client_phone,
        o.client_address,
        o.total_price,
        o.scheduled_date,
        ot.name as order_type_name,
        c.name as company_name,
        c.ico,
        c.dic,
        c.address as company_address,
        c.email as company_email,
        c.logo_url as company_logo,
        c.contact_data
      FROM orders o
      LEFT JOIN order_types ot ON o.order_type_id = ot.id
      LEFT JOIN companies c ON o.company_id = c.id
      WHERE o.quote_link = ?`,
      [quoteLink]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Cenová ponuka nebola nájdená.' });
    }

    const order = orders[0];

    // Parse contact_data to get phone
    let companyPhone = null;
    if (order.contact_data) {
      try {
        const contactData = typeof order.contact_data === 'string'
          ? JSON.parse(order.contact_data)
          : order.contact_data;
        companyPhone = contactData.phone;
      } catch (e) {
        console.error('Error parsing contact_data:', e);
      }
    }

    // Add parsed phone to order object
    order.company_phone = companyPhone;

    // Get quote stage
    const [stages] = await pool.query(
      `SELECT * FROM order_stages
       WHERE order_id = ? AND stage = 'quote'
       ORDER BY completed_at DESC LIMIT 1`,
      [order.id]
    );

    if (stages.length === 0) {
      return res.status(404).json({ message: 'Cenová ponuka ešte nebola vytvorená.' });
    }

    const quoteStage = stages[0];
    const quoteData = typeof quoteStage.checklist_data === 'string'
      ? JSON.parse(quoteStage.checklist_data)
      : quoteStage.checklist_data;

    // Get survey data if exists
    const [surveyStages] = await pool.query(
      `SELECT * FROM order_stages
       WHERE order_id = ? AND stage = 'survey'
       ORDER BY completed_at DESC LIMIT 1`,
      [order.id]
    );

    let surveyData = null;
    if (surveyStages.length > 0) {
      const surveyStage = surveyStages[0];
      const checklist = typeof surveyStage.checklist_data === 'string'
        ? JSON.parse(surveyStage.checklist_data)
        : surveyStage.checklist_data;
      const photos = typeof surveyStage.photos === 'string'
        ? JSON.parse(surveyStage.photos)
        : surveyStage.photos;

      surveyData = {
        notes: checklist?.notes || null,
        photos: photos || [],
        created_at: surveyStage.completed_at
      };
    }

    res.json({
      order,
      quote: {
        ...quoteData,
        company_signature: quoteStage.signature_data,
        client_signature: quoteStage.client_signature_data,
        client_signed_at: quoteStage.client_signed_at,
        created_at: quoteStage.completed_at
      },
      survey: surveyData
    });
}));

// POST /api/public/quote/:quoteLink/sign - Client signs the quote
router.post('/public/quote/:quoteLink/sign', asyncHandler(async (req, res) => {
    const { quoteLink } = req.params;
    const { signature_data } = req.body;

    if (!signature_data) {
      return res.status(400).json({ message: 'Podpis je povinný.' });
    }

    // Get order
    const [orders] = await pool.query(
      'SELECT id, order_number, company_id FROM orders WHERE quote_link = ?',
      [quoteLink]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Cenová ponuka nebola nájdená.' });
    }

    const order = orders[0];
    const orderId = order.id;

    // Update quote stage with client signature and timestamp
    await pool.query(
      `UPDATE order_stages
       SET client_signature_data = ?, client_signed_at = NOW()
       WHERE order_id = ? AND stage = 'quote'`,
      [signature_data, orderId]
    );

    // Update order status to 'assigned' (ready for installation assignment)
    await pool.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      ['assigned', orderId]
    );

    // Log client signature activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    console.log('🔵 [Client Signature] Logging activity:', {
      orderId,
      order_number: order.order_number,
      company_id: order.company_id
    });
    await logActivity(
      null, // No user_id for public client signature
      'order.client_signature',
      'order',
      orderId,
      {
        order_number: order.order_number,
        signed_at: new Date().toISOString(),
        quote_link: quoteLink
      },
      order.company_id,
      ipAddress,
      req.headers['user-agent']
    );
    console.log('✅ [Client Signature] Activity logged successfully');

    // Send notification to company admin(s) about client signature
    const [admins] = await pool.query(
      'SELECT id FROM users WHERE company_id = ? AND role = ?',
      [order.company_id, 'companyadmin']
    );

    for (const admin of admins) {
      await createNotification(
        admin.id,
        'order.client_signature',
        'Cenová ponuka podpísaná klientom',
        `Klient podpísal cenovú ponuku pre zákazku ${order.order_number}. Zákazka je pripravená na priradenie montážnika.`,
        null,
        null
      );
    }

    res.json({ message: 'Cenová ponuka bola podpísaná.' });
}));

// GET /api/orders/calendar - Get orders for calendar view
router.get('/calendar', verifyToken, requireRole('companyadmin', 'employee'), ensureCompanyId, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.role;
    const companyId = req.company_id;
    const { start, end, employee_id, order_type_id, status } = req.query;

    // Build query
    let query = `
      SELECT
        o.id,
        o.order_number,
        o.client_name,
        o.scheduled_date,
        o.status,
        o.total_price,
        ot.name as order_type_name,
        e.first_name as employee_first_name,
        e.last_name as employee_last_name
      FROM orders o
      LEFT JOIN order_types ot ON o.order_type_id = ot.id
      LEFT JOIN employees e ON o.assigned_employee_id = e.id
      WHERE o.company_id = ?
    `;

    const params = [companyId];

    // Filter by date range
    if (start && end) {
      query += ` AND o.scheduled_date BETWEEN ? AND ?`;
      params.push(start, end);
    }

    // Filter by employee (only for companyadmin)
    if (userRole === 'companyadmin' && employee_id) {
      query += ` AND o.assigned_employee_id = ?`;
      params.push(employee_id);
    }

    // If user is employee, show only their orders
    if (userRole === 'employee') {
      const [employee] = await pool.query(
        'SELECT id FROM employees WHERE user_id = ? AND company_id = ?',
        [userId, companyId]
      );

      if (employee.length > 0) {
        query += ` AND o.assigned_employee_id = ?`;
        params.push(employee[0].id);
      }
    }

    // Filter by order type
    if (order_type_id) {
      query += ` AND o.order_type_id = ?`;
      params.push(order_type_id);
    }

    // Filter by status
    if (status) {
      query += ` AND o.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY o.scheduled_date ASC`;

    const [orders] = await pool.query(query, params);

    // Format for FullCalendar
    const events = orders.map(order => {
      // Color based on status
      let color = '#6b7280'; // gray-500
      switch (order.status) {
        case 'survey':
          color = '#3b82f6'; // blue-500
          break;
        case 'quote':
          color = '#f59e0b'; // amber-500
          break;
        case 'assigned':
          color = '#8b5cf6'; // violet-500
          break;
        case 'in_progress':
          color = '#10b981'; // emerald-500
          break;
        case 'completed':
          color = '#22c55e'; // green-500
          break;
        case 'cancelled':
          color = '#ef4444'; // red-500
          break;
      }

      return {
        id: order.id,
        title: `${order.order_number} - ${order.client_name}`,
        start: order.scheduled_date,
        backgroundColor: color,
        borderColor: color,
        extendedProps: {
          orderNumber: order.order_number,
          clientName: order.client_name,
          status: order.status,
          totalPrice: order.total_price,
          orderTypeName: order.order_type_name,
          employeeName: order.employee_first_name && order.employee_last_name
            ? `${order.employee_first_name} ${order.employee_last_name}`
            : null
        }
      };
    });

    res.json({ events });
}));

// GET /api/orders/:id - Get single order detail
router.get('/:id', verifyToken, requireRole('companyadmin', 'employee'), ensureCompanyId, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const companyId = req.company_id;

    // Get order
    const [orders] = await pool.query(
      `SELECT
        o.*,
        ot.name as order_type_name,
        ot.default_checklist,
        e.first_name as employee_first_name,
        e.last_name as employee_last_name,
        e.phone as employee_phone
      FROM orders o
      LEFT JOIN order_types ot ON o.order_type_id = ot.id
      LEFT JOIN employees e ON o.assigned_employee_id = e.id
      WHERE o.id = ? AND o.company_id = ?`,
      [id, companyId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Zákazka nenájdená.' });
    }

    const order = orders[0];

    // Get order activity logs (complete history)
    const [activityLogs] = await pool.query(
      `SELECT
        al.*,
        u.name as user_name
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.entity_type = 'order' AND al.entity_id = ?
      ORDER BY al.created_at DESC`,
      [id]
    );

    // Parse details JSON
    const formattedLogs = activityLogs.map(log => ({
      ...log,
      details: typeof log.details === 'string'
        ? JSON.parse(log.details)
        : log.details,
      user_name: log.user_name || (log.action === 'order.client_signature' ? 'Klient' : 'Neznámy')
    }));

    // Get order stages
    const [stages] = await pool.query(
      `SELECT * FROM order_stages WHERE order_id = ? ORDER BY completed_at DESC`,
      [id]
    );

    // Parse stage data
    const formattedStages = stages.map(stage => ({
      ...stage,
      checklist_data: typeof stage.checklist_data === 'string'
        ? JSON.parse(stage.checklist_data)
        : stage.checklist_data,
      photos: typeof stage.photos === 'string'
        ? JSON.parse(stage.photos)
        : stage.photos
    }));

    res.json({
      order,
      activity_logs: formattedLogs,
      stages: formattedStages
    });
}));

// GET /api/orders - Get all orders for company with filters
router.get('/', verifyToken, requireRole('companyadmin', 'employee'), ensureCompanyId, asyncHandler(async (req, res) => {
    const companyId = req.company_id;
    const { status, employee_id, search } = req.query;

    let query = `
      SELECT o.*,
             ot.name as order_type_name,
             e.first_name as employee_first_name,
             e.last_name as employee_last_name
      FROM orders o
      LEFT JOIN order_types ot ON o.order_type_id = ot.id
      LEFT JOIN employees e ON o.assigned_employee_id = e.id
      WHERE o.company_id = ?
    `;

    const params = [companyId];

    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }

    if (employee_id) {
      query += ' AND o.assigned_employee_id = ?';
      params.push(employee_id);
    }

    if (search) {
      query += ' AND (o.order_number LIKE ? OR o.client_name LIKE ? OR o.client_email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY o.created_at DESC';

    const [orders] = await pool.query(query, params);

    res.json({ orders });
}));

// POST /api/orders - Create new order
router.post('/', verifyToken, requireRole('companyadmin', 'employee'), ensureCompanyId, asyncHandler(async (req, res) => {
    const companyId = req.company_id;
    const userId = req.user.id;
    const {
      order_type_id,
      client_name,
      client_email,
      client_phone,
      client_address,
      client_is_company,
      client_company_name,
      client_ico,
      client_dic,
      notes
    } = req.body;

    // Validation
    if (!order_type_id || !client_name) {
      return res.status(400).json({ message: 'Typ montáže a meno klienta sú povinné.' });
    }

    // Verify order type belongs to company
    const [orderTypes] = await pool.query(
      'SELECT id FROM order_types WHERE id = ? AND company_id = ?',
      [order_type_id, companyId]
    );

    if (orderTypes.length === 0) {
      return res.status(400).json({ message: 'Neplatný typ montáže.' });
    }

    // Generate unique order number (format: ORD-YYYY-####)
    const year = new Date().getFullYear();
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as count FROM orders WHERE company_id = ? AND YEAR(created_at) = ?',
      [companyId, year]
    );
    const orderCount = countResult[0].count + 1;
    const orderNumber = `ORD-${year}-${String(orderCount).padStart(4, '0')}`;

    // Generate unique link
    const uniqueLink = crypto.randomBytes(16).toString('hex');

    // Create order
    const [result] = await pool.query(
      `INSERT INTO orders
       (company_id, order_type_id, order_number, client_name, client_email,
        client_phone, client_address, client_is_company, client_company_name,
        client_ico, client_dic, status, notes, unique_link)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'survey', ?, ?)`,
      [companyId, order_type_id, orderNumber, client_name, client_email,
       client_phone, client_address, client_is_company || false, client_company_name || null,
       client_ico || null, client_dic || null, notes, uniqueLink]
    );

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await logActivity(
      userId,
      'order.create',
      'order',
      result.insertId,
      { order_number: orderNumber, client_name },
      companyId,
      ipAddress,
      userAgent
    );

    res.status(201).json({
      message: 'Zákazka vytvorená.',
      order: {
        id: result.insertId,
        order_number: orderNumber,
        unique_link: uniqueLink
      }
    });
}));

// PUT /api/orders/:id - Update order
router.put('/:id', verifyToken, requireRole('companyadmin', 'employee'), ensureCompanyId, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const companyId = req.company_id;
    const userId = req.user.id;
    const {
      client_name,
      client_email,
      client_phone,
      client_address,
      assigned_employee_id,
      scheduled_date,
      status,
      total_price,
      notes
    } = req.body;

    // Verify order belongs to company
    const [orders] = await pool.query(
      'SELECT id FROM orders WHERE id = ? AND company_id = ?',
      [id, companyId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Zákazka nenájdená.' });
    }

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (client_name !== undefined) {
      updates.push('client_name = ?');
      params.push(client_name);
    }
    if (client_email !== undefined) {
      updates.push('client_email = ?');
      params.push(client_email);
    }
    if (client_phone !== undefined) {
      updates.push('client_phone = ?');
      params.push(client_phone);
    }
    if (client_address !== undefined) {
      updates.push('client_address = ?');
      params.push(client_address);
    }
    if (assigned_employee_id !== undefined) {
      updates.push('assigned_employee_id = ?');
      params.push(assigned_employee_id);
    }
    if (scheduled_date !== undefined) {
      updates.push('scheduled_date = ?');
      params.push(scheduled_date);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }
    if (total_price !== undefined) {
      updates.push('total_price = ?');
      params.push(total_price);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes);
    }

    // Generate quote_link if not exists and we're updating scheduled_date or total_price
    let generatedQuoteLink = null;
    if ((scheduled_date !== undefined || total_price !== undefined)) {
      // Check if quote_link already exists
      const [existing] = await pool.query('SELECT quote_link FROM orders WHERE id = ?', [id]);
      if (existing.length > 0 && !existing[0].quote_link) {
        generatedQuoteLink = crypto.randomBytes(16).toString('hex');
        updates.push('quote_link = ?');
        params.push(generatedQuoteLink);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'Žiadne údaje na aktualizáciu.' });
    }

    params.push(id, companyId);

    await pool.query(
      `UPDATE orders SET ${updates.join(', ')} WHERE id = ? AND company_id = ?`,
      params
    );

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await logActivity(
      userId,
      'order.update',
      'order',
      parseInt(id),
      { updated_fields: Object.keys(req.body) },
      companyId,
      ipAddress,
      userAgent
    );

    res.json({
      message: 'Zákazka aktualizovaná.',
      quote_link: generatedQuoteLink
    });
}));

// POST /api/orders/:id/stage - Add new stage to order
router.post('/:id/stage', verifyToken, requireRole('companyadmin', 'employee'), ensureCompanyId, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const companyId = req.company_id;
    const userId = req.user.id;
    const { stage, checklist_data, photos, signature_data } = req.body;

    // Validation
    if (!stage || !['survey', 'quote', 'installation', 'completion'].includes(stage)) {
      return res.status(400).json({ message: 'Neplatná etapa zákazky.' });
    }

    // Verify order belongs to company
    const [orders] = await pool.query(
      'SELECT id, order_number FROM orders WHERE id = ? AND company_id = ?',
      [id, companyId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Zákazka nenájdená.' });
    }

    // Create stage with user_id
    const [result] = await pool.query(
      `INSERT INTO order_stages (order_id, stage, checklist_data, photos, signature_data, user_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        stage,
        JSON.stringify(checklist_data || {}),
        JSON.stringify(photos || []),
        signature_data || null,
        userId
      ]
    );

    // Generate quote_link when creating quote stage (if not exists)
    let generatedQuoteLink = null;
    if (stage === 'quote') {
      const [existing] = await pool.query('SELECT quote_link FROM orders WHERE id = ?', [id]);
      if (existing.length > 0 && !existing[0].quote_link) {
        generatedQuoteLink = crypto.randomBytes(16).toString('hex');
        await pool.query('UPDATE orders SET quote_link = ? WHERE id = ?', [generatedQuoteLink, id]);
      }
    }

    // Update order status based on stage
    const statusMap = {
      'survey': 'survey',
      'quote': 'quote',
      'installation': 'in_progress',
      'completion': 'completed'
    };

    await pool.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [statusMap[stage], id]
    );

    // Log activity with user info
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Get user info for logging
    const [users] = await pool.query(
      'SELECT name FROM users WHERE id = ?',
      [userId]
    );
    const userName = users.length > 0 ? users[0].name : 'Neznámy';

    // Build stage-specific details for logging
    const logDetails = {
      stage,
      order_number: orders[0].order_number,
      created_by: userName
    };

    // Add stage-specific info
    switch (stage) {
      case 'survey':
        if (photos && photos.length > 0) logDetails.photos_count = photos.length;
        if (checklist_data?.notes) logDetails.has_notes = true;
        logDetails.signed_by = 'klient';
        break;
      case 'quote':
        if (checklist_data?.total_price) logDetails.total_price = checklist_data.total_price;
        if (checklist_data?.scheduled_date) logDetails.scheduled_date = checklist_data.scheduled_date;
        logDetails.signed_by = 'technik';
        break;
      case 'installation':
        if (photos && photos.length > 0) {
          const beforeCount = photos.filter(p => p.type === 'before').length;
          const afterCount = photos.filter(p => p.type === 'after').length;
          logDetails.photos_before = beforeCount;
          logDetails.photos_after = afterCount;
        }
        logDetails.signed_by = 'klient';
        break;
      case 'completion':
        if (checklist_data?.client_satisfaction) logDetails.satisfaction = checklist_data.client_satisfaction;
        logDetails.signed_by = 'klient';
        break;
    }

    await logActivity(
      userId,
      'order.stage_complete',
      'order',
      parseInt(id),
      logDetails,
      companyId,
      ipAddress,
      userAgent
    );

    res.status(201).json({
      message: 'Etapa zákazky dokončená.',
      stage_id: result.insertId,
      quote_link: generatedQuoteLink
    });
}));

// PUT /api/orders/:id/stage/:stageId - Update existing stage
router.put('/:id/stage/:stageId', verifyToken, requireRole('companyadmin', 'employee'), ensureCompanyId, asyncHandler(async (req, res) => {
    const { id, stageId } = req.params;
    const companyId = req.company_id;
    const userId = req.user.id;
    const { checklist_data, photos, signature_data } = req.body;

    // Verify order belongs to company
    const [orders] = await pool.query(
      'SELECT id, order_number FROM orders WHERE id = ? AND company_id = ?',
      [id, companyId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Zákazka nenájdená.' });
    }

    // Verify stage belongs to order
    const [stages] = await pool.query(
      'SELECT id, stage FROM order_stages WHERE id = ? AND order_id = ?',
      [stageId, id]
    );

    if (stages.length === 0) {
      return res.status(404).json({ message: 'Etapa nenájdená.' });
    }

    const existingStage = stages[0];

    // Update stage
    const updates = [];
    const params = [];

    if (checklist_data !== undefined) {
      updates.push('checklist_data = ?');
      params.push(JSON.stringify(checklist_data));
    }
    if (photos !== undefined) {
      updates.push('photos = ?');
      params.push(JSON.stringify(photos));
    }
    if (signature_data !== undefined) {
      updates.push('signature_data = ?');
      params.push(signature_data);
    }

    if (updates.length > 0) {
      params.push(stageId);
      await pool.query(
        `UPDATE order_stages SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
    }

    // Log activity with details of what changed
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Get user info for logging
    const [users] = await pool.query(
      'SELECT name FROM users WHERE id = ?',
      [userId]
    );
    const userName = users.length > 0 ? users[0].name : 'Neznámy';

    // Determine what was changed based on stage type
    const changes = [];
    if (checklist_data !== undefined) {
      const stageName = existingStage.stage;
      switch (stageName) {
        case 'survey':
          changes.push('poznámky z obhliadky');
          break;
        case 'quote':
          changes.push('ponuka (cena, dátum, materiály)');
          break;
        case 'installation':
          changes.push('poznámky z montáže');
          break;
        case 'completion':
          changes.push('hodnotenie a záručné podmienky');
          break;
        default:
          changes.push('údaje');
      }
    }
    if (photos !== undefined && photos.length > 0) {
      changes.push(`fotky (${photos.length})`);
    }
    if (signature_data !== undefined) {
      // Determine who signed based on stage
      const stageName = existingStage.stage;
      if (stageName === 'quote') {
        changes.push('podpis technika');
      } else {
        changes.push('podpis klienta');
      }
    }

    await logActivity(
      userId,
      'order.stage_update',
      'order',
      parseInt(id),
      {
        stage_id: stageId,
        stage: existingStage.stage,
        order_number: orders[0].order_number,
        updated_by: userName,
        changes: changes.join(', ')
      },
      companyId,
      ipAddress,
      userAgent
    );

    res.json({ message: 'Etapa aktualizovaná.' });
}));

// DELETE /api/orders/:id - Delete order (companyadmin only)
router.delete('/:id', verifyToken, requireRole('companyadmin'), ensureCompanyId, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const companyId = req.company_id;
    const userId = req.user.id;

    // Verify order belongs to company
    const [orders] = await pool.query(
      'SELECT id, order_number FROM orders WHERE id = ? AND company_id = ?',
      [id, companyId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Zákazka nenájdená.' });
    }

    // Delete cascade: invoices, stages, then order
    await pool.query('DELETE FROM invoices WHERE order_id = ?', [id]);
    await pool.query('DELETE FROM order_stages WHERE order_id = ?', [id]);
    await pool.query('DELETE FROM orders WHERE id = ?', [id]);

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await logActivity(
      userId,
      'order.delete',
      'order',
      parseInt(id),
      { order_number: orders[0].order_number },
      companyId,
      ipAddress,
      userAgent
    );

    res.json({ message: 'Zákazka vymazaná.' });
}));

export default router;
