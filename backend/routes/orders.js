import express from 'express';
import pool from '../config/db.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { ensureCompanyId } from '../middleware/companyMiddleware.js';
import { asyncHandler } from '../utils/errorHandler.js';
import { logActivity } from '../middleware/logger.js';
import crypto from 'crypto';

const router = express.Router();

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

    res.json({ order });
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
        client_phone, client_address, status, notes, unique_link)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'survey', ?, ?)`,
      [companyId, order_type_id, orderNumber, client_name, client_email,
       client_phone, client_address, notes, uniqueLink]
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

    res.json({ message: 'Zákazka aktualizovaná.' });
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

    // Create stage
    const [result] = await pool.query(
      `INSERT INTO order_stages (order_id, stage, checklist_data, photos, signature_data)
       VALUES (?, ?, ?, ?, ?)`,
      [
        id,
        stage,
        JSON.stringify(checklist_data || {}),
        JSON.stringify(photos || []),
        signature_data || null
      ]
    );

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

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await logActivity(
      userId,
      'order.stage_complete',
      'order',
      parseInt(id),
      { stage, order_number: orders[0].order_number },
      companyId,
      ipAddress,
      userAgent
    );

    res.status(201).json({
      message: 'Etapa zákazky dokončená.',
      stage_id: result.insertId
    });
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
