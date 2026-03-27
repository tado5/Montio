import express from 'express';
import pool from '../config/db.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { logActivity } from '../middleware/logger.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// GET /api/employees - Get all employees for company
router.get('/', verifyToken, requireRole('companyadmin', 'employee'), async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's company_id
    const [users] = await pool.query(
      'SELECT company_id FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0 || !users[0].company_id) {
      return res.status(404).json({ message: 'Používateľ nemá priradenú firmu.' });
    }

    const companyId = users[0].company_id;

    // Get employees with user info and order stats
    const [employees] = await pool.query(
      `SELECT
        e.id,
        e.user_id,
        e.position,
        e.phone,
        e.status,
        e.created_at,
        u.name,
        u.email,
        COUNT(o.id) as total_orders,
        SUM(CASE WHEN o.status = 'completed' THEN 1 ELSE 0 END) as completed_orders
      FROM employees e
      INNER JOIN users u ON e.user_id = u.id
      LEFT JOIN orders o ON e.id = o.employee_id
      WHERE e.company_id = ?
      GROUP BY e.id
      ORDER BY e.created_at DESC`,
      [companyId]
    );

    res.json({ employees });

  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Chyba servera.' });
  }
});

// GET /api/employees/:id - Get single employee
router.get('/:id', verifyToken, requireRole('companyadmin', 'employee'), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get user's company_id
    const [users] = await pool.query(
      'SELECT company_id FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0 || !users[0].company_id) {
      return res.status(404).json({ message: 'Používateľ nemá priradenú firmu.' });
    }

    const companyId = users[0].company_id;

    // Get employee with user info
    const [employees] = await pool.query(
      `SELECT
        e.id,
        e.user_id,
        e.position,
        e.phone,
        e.status,
        e.created_at,
        u.name,
        u.email
      FROM employees e
      INNER JOIN users u ON e.user_id = u.id
      WHERE e.id = ? AND e.company_id = ?`,
      [id, companyId]
    );

    if (employees.length === 0) {
      return res.status(404).json({ message: 'Zamestnanec nenájdený.' });
    }

    res.json({ employee: employees[0] });

  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ message: 'Chyba servera.' });
  }
});

// POST /api/employees - Create new employee + user account
router.post('/', verifyToken, requireRole('companyadmin'), async (req, res) => {
  try {
    const { name, email, password, position, phone } = req.body;
    const userId = req.user.id;

    // Validation
    if (!name || !email || !password || !position) {
      return res.status(400).json({ message: 'Meno, email, heslo a pozícia sú povinné.' });
    }

    // Get user's company_id
    const [users] = await pool.query(
      'SELECT company_id FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0 || !users[0].company_id) {
      return res.status(404).json({ message: 'Používateľ nemá priradenú firmu.' });
    }

    const companyId = users[0].company_id;

    // Check if email already exists
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email už existuje.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Create user account
      const [userResult] = await connection.query(
        `INSERT INTO users (name, email, password, role, company_id, theme, created_at)
         VALUES (?, ?, ?, 'employee', ?, 'light', NOW())`,
        [name, email, hashedPassword, companyId]
      );

      const newUserId = userResult.insertId;

      // Create employee record
      const [employeeResult] = await connection.query(
        `INSERT INTO employees (company_id, user_id, position, phone, status, created_at)
         VALUES (?, ?, ?, ?, 'active', NOW())`,
        [companyId, newUserId, position, phone || null]
      );

      const newEmployeeId = employeeResult.insertId;

      // Commit transaction
      await connection.commit();
      connection.release();

      // Log activity
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];

      await logActivity(
        userId,
        'employee.create',
        'employee',
        newEmployeeId,
        { name, email, position },
        companyId,
        ipAddress,
        userAgent
      );

      res.status(201).json({
        message: 'Zamestnanec vytvorený.',
        employee: {
          id: newEmployeeId,
          user_id: newUserId,
          name,
          email,
          position,
          phone,
          status: 'active'
        }
      });

    } catch (err) {
      await connection.rollback();
      connection.release();
      throw err;
    }

  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ message: 'Chyba servera.' });
  }
});

// PUT /api/employees/:id - Update employee
router.put('/:id', verifyToken, requireRole('companyadmin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, position, phone, status } = req.body;
    const userId = req.user.id;

    // Validation
    if (!name || !email || !position) {
      return res.status(400).json({ message: 'Meno, email a pozícia sú povinné.' });
    }

    // Get user's company_id
    const [users] = await pool.query(
      'SELECT company_id FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0 || !users[0].company_id) {
      return res.status(404).json({ message: 'Používateľ nemá priradenú firmu.' });
    }

    const companyId = users[0].company_id;

    // Check if employee exists and belongs to user's company
    const [existing] = await pool.query(
      'SELECT user_id FROM employees WHERE id = ? AND company_id = ?',
      [id, companyId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Zamestnanec nenájdený.' });
    }

    const employeeUserId = existing[0].user_id;

    // Check if email already exists (excluding current user)
    const [existingEmail] = await pool.query(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, employeeUserId]
    );

    if (existingEmail.length > 0) {
      return res.status(400).json({ message: 'Email už existuje.' });
    }

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Update user account
      await connection.query(
        'UPDATE users SET name = ?, email = ? WHERE id = ?',
        [name, email, employeeUserId]
      );

      // Update employee record
      await connection.query(
        'UPDATE employees SET position = ?, phone = ?, status = ? WHERE id = ? AND company_id = ?',
        [position, phone || null, status || 'active', id, companyId]
      );

      // Commit transaction
      await connection.commit();
      connection.release();

      // Log activity
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];

      await logActivity(
        userId,
        'employee.update',
        'employee',
        parseInt(id),
        { name, email, position, status },
        companyId,
        ipAddress,
        userAgent
      );

      res.json({
        message: 'Zamestnanec aktualizovaný.',
        employee: {
          id: parseInt(id),
          user_id: employeeUserId,
          name,
          email,
          position,
          phone,
          status
        }
      });

    } catch (err) {
      await connection.rollback();
      connection.release();
      throw err;
    }

  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ message: 'Chyba servera.' });
  }
});

// DELETE /api/employees/:id - Deactivate employee (soft delete)
router.delete('/:id', verifyToken, requireRole('companyadmin'), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get user's company_id
    const [users] = await pool.query(
      'SELECT company_id FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0 || !users[0].company_id) {
      return res.status(404).json({ message: 'Používateľ nemá priradenú firmu.' });
    }

    const companyId = users[0].company_id;

    // Check if employee exists and belongs to user's company
    const [existing] = await pool.query(
      `SELECT e.id, e.user_id, u.name
       FROM employees e
       INNER JOIN users u ON e.user_id = u.id
       WHERE e.id = ? AND e.company_id = ?`,
      [id, companyId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Zamestnanec nenájdený.' });
    }

    const employeeName = existing[0].name;

    // Deactivate employee (soft delete)
    await pool.query(
      'UPDATE employees SET status = ? WHERE id = ? AND company_id = ?',
      ['inactive', id, companyId]
    );

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await logActivity(
      userId,
      'employee.deactivate',
      'employee',
      parseInt(id),
      { name: employeeName },
      companyId,
      ipAddress,
      userAgent
    );

    res.json({ message: 'Zamestnanec deaktivovaný.' });

  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ message: 'Chyba servera.' });
  }
});

export default router;
