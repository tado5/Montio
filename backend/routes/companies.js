import express from 'express';
import pool from '../config/db.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { logActivity } from '../middleware/logger.js';
import { sendInviteEmail } from '../utils/sendEmail.js';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// POST /api/companies - Send invite to new company (superadmin only)
router.post('/', verifyToken, requireRole('superadmin'), async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email je povinný.' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Neplatný email formát.' });
    }

    // Check if email already exists
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Tento email už existuje v systéme.' });
    }

    // Generate unique invite token and public ID
    const inviteToken = crypto.randomBytes(32).toString('hex');
    const publicId = uuidv4();

    // Create pending company (with email)
    const [result] = await pool.query(
      `INSERT INTO companies (public_id, email, name, invite_token, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [publicId, email, `Nová firma (${email})`, inviteToken]
    );

    const companyId = result.insertId;

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await logActivity(
      req.user.id,
      'company.invite',
      'company',
      companyId,
      { email, invited_by: req.user.email },
      null,
      ipAddress,
      userAgent
    );

    // Generate invite link (Frontend URL, not backend)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const inviteLink = `${frontendUrl}/register/${inviteToken}`;

    // Send email (production only, dev just logs)
    await sendInviteEmail(email, inviteLink);

    res.status(201).json({
      message: 'Pozvánka odoslaná.',
      invite: {
        email,
        invite_token: inviteToken,
        invite_link: inviteLink,
        company_id: companyId
      }
    });

  } catch (error) {
    console.error('Send invite error:', error);
    res.status(500).json({ message: 'Chyba servera.' });
  }
});

// GET /api/companies/:publicId - Get company detail (superadmin only)
router.get('/:publicId', verifyToken, requireRole('superadmin'), async (req, res) => {
  try {
    const { publicId } = req.params;

    // Get company info
    const [companies] = await pool.query(
      `SELECT id, public_id, name, logo_url, ico, dic, address, billing_data, invite_token, status, created_at
       FROM companies
       WHERE public_id = ?`,
      [publicId]
    );

    if (companies.length === 0) {
      return res.status(404).json({ message: 'Firma nenájdená.' });
    }

    const company = companies[0];

    // Get company users
    const [users] = await pool.query(
      `SELECT u.id, u.email, u.role, u.created_at,
              e.first_name, e.last_name, e.phone, e.position, e.status as employee_status
       FROM users u
       LEFT JOIN employees e ON u.id = e.user_id
       WHERE u.company_id = ?
       ORDER BY u.role, u.created_at DESC`,
      [company.id]
    );

    // Get activity logs for this company (last 10 for initial load)
    const [logs] = await pool.query(
      `SELECT al.id, al.action, al.entity_type, al.entity_id, al.details,
              al.ip_address, al.created_at,
              u.email as user_email, u.role as user_role
       FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE al.company_id = ? OR al.entity_type = 'company' AND al.entity_id = ?
       ORDER BY al.created_at DESC
       LIMIT 10`,
      [company.id, company.id]
    );

    // Get total logs count for pagination
    const [logsCount] = await pool.query(
      `SELECT COUNT(*) as count
       FROM activity_logs
       WHERE company_id = ? OR (entity_type = 'company' AND entity_id = ?)`,
      [company.id, company.id]
    );

    // Get order types count
    const [orderTypesCount] = await pool.query(
      'SELECT COUNT(*) as count FROM order_types WHERE company_id = ?',
      [company.id]
    );

    // Get orders count
    const [ordersCount] = await pool.query(
      'SELECT COUNT(*) as count FROM orders WHERE company_id = ?',
      [company.id]
    );

    // Get invoices count
    const [invoicesCount] = await pool.query(
      'SELECT COUNT(*) as count FROM invoices WHERE company_id = ?',
      [company.id]
    );

    res.json({
      company: {
        ...company,
        id: company.public_id // Return public_id as id for frontend
      },
      users,
      logs,
      logsPagination: {
        total: logsCount[0].count,
        loaded: logs.length,
        hasMore: logsCount[0].count > 10
      },
      stats: {
        order_types: orderTypesCount[0].count,
        orders: ordersCount[0].count,
        invoices: invoicesCount[0].count,
        users: users.length
      }
    });

  } catch (error) {
    console.error('Get company detail error:', error);
    res.status(500).json({ message: 'Chyba servera.' });
  }
});

// GET /api/companies/:publicId/logs - Get company activity logs with pagination (superadmin only)
router.get('/:publicId/logs', verifyToken, requireRole('superadmin'), async (req, res) => {
  try {
    const { publicId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Get company internal ID from public_id
    const [companies] = await pool.query(
      'SELECT id FROM companies WHERE public_id = ?',
      [publicId]
    );

    if (companies.length === 0) {
      return res.status(404).json({ message: 'Firma nenájdená.' });
    }

    const companyId = companies[0].id;

    // Get total count
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total
       FROM activity_logs
       WHERE company_id = ? OR (entity_type = 'company' AND entity_id = ?)`,
      [companyId, companyId]
    );

    // Get logs with pagination
    const [logs] = await pool.query(
      `SELECT al.id, al.action, al.entity_type, al.entity_id, al.details,
              al.ip_address, al.created_at,
              u.email as user_email, u.role as user_role
       FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE al.company_id = ? OR (al.entity_type = 'company' AND al.entity_id = ?)
       ORDER BY al.created_at DESC
       LIMIT ? OFFSET ?`,
      [companyId, companyId, parseInt(limit), parseInt(offset)]
    );

    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    });

  } catch (error) {
    console.error('Get company logs error:', error);
    res.status(500).json({ message: 'Chyba servera.' });
  }
});

// PUT /api/companies/:publicId/deactivate - Deactivate company (superadmin only)
router.put('/:publicId/deactivate', verifyToken, requireRole('superadmin'), async (req, res) => {
  try {
    const { publicId } = req.params;
    const { companyName } = req.body;

    // Get company
    const [companies] = await pool.query(
      'SELECT id, public_id, name, status FROM companies WHERE public_id = ?',
      [publicId]
    );

    if (companies.length === 0) {
      return res.status(404).json({ message: 'Firma nenájdená.' });
    }

    const company = companies[0];

    // Verify company name matches (security check)
    if (companyName !== company.name) {
      return res.status(400).json({ message: 'Názov firmy sa nezhoduje.' });
    }

    if (company.status === 'inactive') {
      return res.status(400).json({ message: 'Firma je už deaktivovaná.' });
    }

    // Deactivate company
    await pool.query(
      'UPDATE companies SET status = ? WHERE id = ?',
      ['inactive', company.id]
    );

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await logActivity(
      req.user.id,
      'company.deactivate',
      'company',
      company.id,
      { company_name: company.name, deactivated_by: req.user.email },
      null,
      ipAddress,
      userAgent
    );

    res.json({
      message: 'Firma bola deaktivovaná.',
      company: { id: company.public_id, name: company.name, status: 'inactive' }
    });

  } catch (error) {
    console.error('Deactivate company error:', error);
    res.status(500).json({ message: 'Chyba servera.' });
  }
});

// PUT /api/companies/:publicId/activate - Activate company (superadmin only)
router.put('/:publicId/activate', verifyToken, requireRole('superadmin'), async (req, res) => {
  try {
    const { publicId } = req.params;

    // Get company
    const [companies] = await pool.query(
      'SELECT id, public_id, name, status FROM companies WHERE public_id = ?',
      [publicId]
    );

    if (companies.length === 0) {
      return res.status(404).json({ message: 'Firma nenájdená.' });
    }

    const company = companies[0];

    if (company.status === 'active') {
      return res.status(400).json({ message: 'Firma je už aktívna.' });
    }

    // Activate company
    await pool.query(
      'UPDATE companies SET status = ? WHERE id = ?',
      ['active', company.id]
    );

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await logActivity(
      req.user.id,
      'company.activate',
      'company',
      company.id,
      { company_name: company.name, activated_by: req.user.email },
      null,
      ipAddress,
      userAgent
    );

    res.json({
      message: 'Firma bola aktivovaná.',
      company: { id: company.public_id, name: company.name, status: 'active' }
    });

  } catch (error) {
    console.error('Activate company error:', error);
    res.status(500).json({ message: 'Chyba servera.' });
  }
});

// DELETE /api/companies/:publicId - Delete pending company (superadmin only)
router.delete('/:publicId', verifyToken, requireRole('superadmin'), async (req, res) => {
  try {
    const { publicId } = req.params;

    // Get company
    const [companies] = await pool.query(
      'SELECT id, public_id, name, status, invite_token FROM companies WHERE public_id = ?',
      [publicId]
    );

    if (companies.length === 0) {
      return res.status(404).json({ message: 'Firma nenájdená.' });
    }

    const company = companies[0];

    // Only allow deletion of pending or inactive companies (NOT active)
    if (company.status === 'active') {
      return res.status(400).json({
        message: 'Nemožno vymazať aktívnu firmu. Najprv ju deaktivujte.'
      });
    }

    // Manual cascade delete (since FK constraints don't have ON DELETE CASCADE)
    // Delete in correct order to avoid FK violations

    // 1. Delete invoices (FK: company_id, order_id)
    await pool.query('DELETE FROM invoices WHERE company_id = ?', [company.id]);

    // 2. Delete order_stages (FK: order_id)
    await pool.query(
      'DELETE FROM order_stages WHERE order_id IN (SELECT id FROM orders WHERE company_id = ?)',
      [company.id]
    );

    // 3. Delete orders (FK: company_id, order_type_id, assigned_employee_id)
    await pool.query('DELETE FROM orders WHERE company_id = ?', [company.id]);

    // 4. Delete employees (FK: company_id, user_id)
    await pool.query('DELETE FROM employees WHERE company_id = ?', [company.id]);

    // 5. Delete order_types (FK: company_id)
    await pool.query('DELETE FROM order_types WHERE company_id = ?', [company.id]);

    // 6. Delete activity_logs (FK: company_id)
    await pool.query('DELETE FROM activity_logs WHERE company_id = ?', [company.id]);

    // 7. Delete notifications (FK: user_id in company)
    await pool.query(
      'DELETE FROM notifications WHERE user_id IN (SELECT id FROM users WHERE company_id = ?)',
      [company.id]
    );

    // 8. Delete users (FK: company_id)
    await pool.query('DELETE FROM users WHERE company_id = ?', [company.id]);

    // 9. Finally, delete company
    await pool.query('DELETE FROM companies WHERE id = ?', [company.id]);

    // Log activity (use company_id = null since company is deleted)
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await logActivity(
      req.user.id,
      'company.delete',
      'company',
      company.id,
      {
        company_name: company.name,
        public_id: company.public_id,
        invite_token: company.invite_token,
        deleted_by: req.user.email
      },
      null,
      ipAddress,
      userAgent
    );

    res.json({
      message: 'Firma bola vymazaná.',
      company: { id: company.public_id, name: company.name }
    });

  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({ message: 'Chyba servera.' });
  }
});

export default router;
