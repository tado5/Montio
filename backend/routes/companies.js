import express from 'express';
import pool from '../config/db.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { logActivity } from '../middleware/logger.js';
import crypto from 'crypto';

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

    // Generate unique invite token
    const inviteToken = crypto.randomBytes(32).toString('hex');

    // Create pending company (without details)
    const [result] = await pool.query(
      `INSERT INTO companies (name, invite_token, status)
       VALUES (?, ?, 'pending')`,
      [`Nová firma (${email})`, inviteToken]
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

    // Generate invite link
    const inviteLink = `${req.protocol}://${req.get('host')}/register?token=${inviteToken}`;

    // TODO: Send email via NodeMailer
    // await sendInviteEmail(email, inviteLink);

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

// GET /api/companies/:id - Get company detail (superadmin only)
router.get('/:id', verifyToken, requireRole('superadmin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Get company info
    const [companies] = await pool.query(
      `SELECT id, name, logo_url, ico, dic, address, billing_data, invite_token, status, created_at
       FROM companies
       WHERE id = ?`,
      [id]
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
      [id]
    );

    // Get activity logs for this company (last 50)
    const [logs] = await pool.query(
      `SELECT al.id, al.action, al.entity_type, al.entity_id, al.details,
              al.ip_address, al.created_at,
              u.email as user_email, u.role as user_role
       FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE al.company_id = ? OR al.entity_type = 'company' AND al.entity_id = ?
       ORDER BY al.created_at DESC
       LIMIT 50`,
      [id, id]
    );

    // Get order types count
    const [orderTypesCount] = await pool.query(
      'SELECT COUNT(*) as count FROM order_types WHERE company_id = ?',
      [id]
    );

    // Get orders count
    const [ordersCount] = await pool.query(
      'SELECT COUNT(*) as count FROM orders WHERE company_id = ?',
      [id]
    );

    // Get invoices count
    const [invoicesCount] = await pool.query(
      'SELECT COUNT(*) as count FROM invoices WHERE company_id = ?',
      [id]
    );

    res.json({
      company,
      users,
      logs,
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

// GET /api/companies/:id/logs - Get company activity logs with pagination (superadmin only)
router.get('/:id/logs', verifyToken, requireRole('superadmin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Get total count
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total
       FROM activity_logs
       WHERE company_id = ? OR (entity_type = 'company' AND entity_id = ?)`,
      [id, id]
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
      [id, id, parseInt(limit), parseInt(offset)]
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

// PUT /api/companies/:id/deactivate - Deactivate company (superadmin only)
router.put('/:id/deactivate', verifyToken, requireRole('superadmin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { companyName } = req.body;

    // Get company
    const [companies] = await pool.query(
      'SELECT id, name, status FROM companies WHERE id = ?',
      [id]
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
      ['inactive', id]
    );

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await logActivity(
      req.user.id,
      'company.deactivate',
      'company',
      id,
      { company_name: company.name, deactivated_by: req.user.email },
      null,
      ipAddress,
      userAgent
    );

    res.json({
      message: 'Firma bola deaktivovaná.',
      company: { id, name: company.name, status: 'inactive' }
    });

  } catch (error) {
    console.error('Deactivate company error:', error);
    res.status(500).json({ message: 'Chyba servera.' });
  }
});

// PUT /api/companies/:id/activate - Activate company (superadmin only)
router.put('/:id/activate', verifyToken, requireRole('superadmin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Get company
    const [companies] = await pool.query(
      'SELECT id, name, status FROM companies WHERE id = ?',
      [id]
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
      ['active', id]
    );

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await logActivity(
      req.user.id,
      'company.activate',
      'company',
      id,
      { company_name: company.name, activated_by: req.user.email },
      null,
      ipAddress,
      userAgent
    );

    res.json({
      message: 'Firma bola aktivovaná.',
      company: { id, name: company.name, status: 'active' }
    });

  } catch (error) {
    console.error('Activate company error:', error);
    res.status(500).json({ message: 'Chyba servera.' });
  }
});

export default router;
