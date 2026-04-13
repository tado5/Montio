import express from 'express';
import pool from '../config/db.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { ensureCompanyId } from '../middleware/companyMiddleware.js';
import { asyncHandler } from '../utils/errorHandler.js';
import { isValidEmail, validateRequired } from '../utils/validation.js';
import { ERROR_MESSAGES } from '../config/constants.js';
import { logActivity } from '../middleware/logger.js';
import { createNotification } from './notifications.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// GET /api/employees - Get all employees for company
router.get('/', verifyToken, requireRole('companyadmin', 'employee'), ensureCompanyId, asyncHandler(async (req, res) => {
    const companyId = req.company_id;

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
      LEFT JOIN orders o ON e.id = o.assigned_employee_id
      WHERE e.company_id = ?
      GROUP BY e.id
      ORDER BY e.created_at DESC`,
      [companyId]
    );

    res.json({ employees });
}));

// GET /api/employees/:id - Get single employee
router.get('/:id', verifyToken, requireRole('companyadmin', 'employee'), ensureCompanyId, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const companyId = req.company_id;

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
}));

// POST /api/employees - Create new employee + user account
router.post('/', verifyToken, requireRole('companyadmin'), ensureCompanyId, asyncHandler(async (req, res) => {
    const { name, email, password, position, phone } = req.body;
    const userId = req.user.id;
    const companyId = req.company_id;

    // Validation
    if (!name || !email || !password || !position) {
      return res.status(400).json({ message: 'Meno, email, heslo a pozícia sú povinné.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: ERROR_MESSAGES.INVALID_EMAIL });
    }

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
    const defaultPasswordHash = hashedPassword; // Store default password for verification

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Create user account
      const [userResult] = await connection.query(
        `INSERT INTO users (name, email, password_hash, role, company_id, position, theme, created_at)
         VALUES (?, ?, ?, 'employee', ?, ?, 'light', NOW())`,
        [name, email, hashedPassword, companyId, position]
      );

      const newUserId = userResult.insertId;

      // Split name into first_name and last_name
      const nameParts = name.trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || nameParts[0]

      // Create employee record with status='created' and password tracking
      const [employeeResult] = await connection.query(
        `INSERT INTO employees (company_id, user_id, first_name, last_name, position, phone, status, must_change_password, default_password_hash, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 'created', 1, ?, NOW())`,
        [companyId, newUserId, firstName, lastName, position, phone || null, defaultPasswordHash]
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

      // Send notification to admin
      await createNotification(
        userId,
        'employee_created',
        'Nový zamestnanec vytvorený',
        `${name} bol pridaný do systému. Zamestnanec musí zmeniť heslo pri prvom prihlásení.`,
        null,
        newEmployeeId
      );

      res.status(201).json({
        message: 'Zamestnanec vytvorený. Musí zmeniť heslo pri prvom prihlásení.',
        employee: {
          id: newEmployeeId,
          user_id: newUserId,
          name,
          email,
          position,
          phone,
          status: 'created',
          must_change_password: true
        }
      });

    } catch (err) {
      await connection.rollback();
      connection.release();
      throw err;
    }
}));

// PUT /api/employees/:id - Update employee
router.put('/:id', verifyToken, requireRole('companyadmin'), ensureCompanyId, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, email, position, phone, status } = req.body;
    const userId = req.user.id;
    const companyId = req.company_id;

    // Validation
    if (!name || !email || !position) {
      return res.status(400).json({ message: 'Meno, email a pozícia sú povinné.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: ERROR_MESSAGES.INVALID_EMAIL });
    }

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
        'UPDATE users SET name = ?, email = ?, position = ? WHERE id = ?',
        [name, email, position, employeeUserId]
      );

      // Split name into first_name and last_name
      const nameParts = name.trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || nameParts[0]

      // Update employee record
      await connection.query(
        'UPDATE employees SET first_name = ?, last_name = ?, position = ?, phone = ?, status = ? WHERE id = ? AND company_id = ?',
        [firstName, lastName, position, phone || null, status || 'active', id, companyId]
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

      // Send notification to employee about profile update
      await createNotification(
        employeeUserId,
        'employee_updated',
        'Váš profil bol aktualizovaný',
        'Administrátor aktualizoval vaše údaje.',
        userId,
        parseInt(id)
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
}));

// DELETE /api/employees/:id - Deactivate employee (soft delete)
router.delete('/:id', verifyToken, requireRole('companyadmin'), ensureCompanyId, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const companyId = req.company_id;

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
    const employeeUserId = existing[0].user_id;

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

    // Send notification to employee
    await createNotification(
      employeeUserId,
      'employee_deactivated',
      'Váš účet bol deaktivovaný',
      'Váš účet bol deaktivovaný administrátorom. Nemôžete sa prihlásiť do systému.',
      userId,
      parseInt(id)
    );

    res.json({ message: 'Zamestnanec deaktivovaný.' });
}));

// PUT /api/employees/:id/change-password - Change default password (first login)
router.put('/:id/change-password', verifyToken, requireRole('employee'), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Súčasné heslo a nové heslo sú povinné.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Nové heslo musí mať aspoň 6 znakov.' });
    }

    // Get employee record
    const [employees] = await pool.query(
      `SELECT e.id, e.user_id, e.company_id, e.status, e.must_change_password, e.default_password_hash, u.name
       FROM employees e
       INNER JOIN users u ON e.user_id = u.id
       WHERE e.id = ? AND e.user_id = ?`,
      [id, userId]
    );

    if (employees.length === 0) {
      return res.status(404).json({ message: 'Zamestnanec nenájdený.' });
    }

    const employee = employees[0];

    // Check if password change is required
    if (!employee.must_change_password) {
      return res.status(400).json({ message: 'Zmena hesla nie je potrebná.' });
    }

    // Verify current password (default password)
    const isPasswordValid = await bcrypt.compare(currentPassword, employee.default_password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Nesprávne súčasné heslo.' });
    }

    // Hash new password
    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Update user password
      await connection.query(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        [newHashedPassword, userId]
      );

      // Update employee: change status to pending_approval, clear must_change_password
      await connection.query(
        `UPDATE employees
         SET status = 'pending_approval', must_change_password = 0, default_password_hash = NULL
         WHERE id = ?`,
        [id]
      );

      // Commit transaction
      await connection.commit();
      connection.release();

      // Log activity
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];

      await logActivity(
        userId,
        'employee.password_change',
        'employee',
        parseInt(id),
        { name: employee.name },
        employee.company_id,
        ipAddress,
        userAgent
      );

      // Get company admin(s) to send notification
      const [admins] = await pool.query(
        `SELECT id FROM users WHERE company_id = ? AND role = 'companyadmin'`,
        [employee.company_id]
      );

      // Send notification to all company admins
      for (const admin of admins) {
        await createNotification(
          admin.id,
          'password_changed',
          'Zamestnanec zmenil heslo',
          `${employee.name} zmenil predvolené heslo a čaká na schválenie.`,
          userId,
          parseInt(id)
        );
      }

      res.json({
        message: 'Heslo bolo zmenené. Čaká sa na schválenie administrátorom.',
        status: 'pending_approval'
      });

    } catch (err) {
      await connection.rollback();
      connection.release();
      throw err;
    }
}));

// PUT /api/employees/:id/approve - Approve employee (pending_approval → active)
router.put('/:id/approve', verifyToken, requireRole('companyadmin'), ensureCompanyId, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const companyId = req.company_id;

    // Get employee record
    const [employees] = await pool.query(
      `SELECT e.id, e.user_id, e.status, u.name, u.email
       FROM employees e
       INNER JOIN users u ON e.user_id = u.id
       WHERE e.id = ? AND e.company_id = ?`,
      [id, companyId]
    );

    if (employees.length === 0) {
      return res.status(404).json({ message: 'Zamestnanec nenájdený.' });
    }

    const employee = employees[0];

    // Check if employee is in pending_approval status
    if (employee.status !== 'pending_approval') {
      return res.status(400).json({
        message: `Zamestnanec nemôže byť schválený. Aktuálny status: ${employee.status}`
      });
    }

    // Update status to active
    await pool.query(
      'UPDATE employees SET status = ? WHERE id = ? AND company_id = ?',
      ['active', id, companyId]
    );

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await logActivity(
      userId,
      'employee.approve',
      'employee',
      parseInt(id),
      { name: employee.name },
      companyId,
      ipAddress,
      userAgent
    );

    // Send notification to employee
    await createNotification(
      employee.user_id,
      'employee_approved',
      'Váš účet bol schválený',
      'Váš účet bol schválený administrátorom. Teraz môžete plne používať systém.',
      userId,
      parseInt(id)
    );

    res.json({
      message: 'Zamestnanec schválený.',
      employee: {
        id: parseInt(id),
        name: employee.name,
        email: employee.email,
        status: 'active'
      }
    });
}));

// PUT /api/employees/:id/reactivate - Reactivate employee (inactive → active)
router.put('/:id/reactivate', verifyToken, requireRole('companyadmin'), ensureCompanyId, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const companyId = req.company_id;

    // Get employee record
    const [employees] = await pool.query(
      `SELECT e.id, e.user_id, e.status, u.name, u.email
       FROM employees e
       INNER JOIN users u ON e.user_id = u.id
       WHERE e.id = ? AND e.company_id = ?`,
      [id, companyId]
    );

    if (employees.length === 0) {
      return res.status(404).json({ message: 'Zamestnanec nenájdený.' });
    }

    const employee = employees[0];

    // Check if employee is inactive
    if (employee.status !== 'inactive') {
      return res.status(400).json({
        message: `Zamestnanec nemôže byť reaktivovaný. Aktuálny status: ${employee.status}`
      });
    }

    // Reactivate employee
    await pool.query(
      'UPDATE employees SET status = ? WHERE id = ? AND company_id = ?',
      ['active', id, companyId]
    );

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await logActivity(
      userId,
      'employee.reactivate',
      'employee',
      parseInt(id),
      { name: employee.name },
      companyId,
      ipAddress,
      userAgent
    );

    // Send notification to employee
    await createNotification(
      employee.user_id,
      'employee_reactivated',
      'Váš účet bol reaktivovaný',
      'Váš účet bol reaktivovaný administrátorom. Môžete sa opäť prihlásiť do systému.',
      userId,
      parseInt(id)
    );

    res.json({
      message: 'Zamestnanec reaktivovaný.',
      employee: {
        id: parseInt(id),
        name: employee.name,
        email: employee.email,
        status: 'active'
      }
    });
}));

// DELETE /api/employees/:id/permanent - Permanently delete employee (only from inactive)
router.delete('/:id/permanent', verifyToken, requireRole('companyadmin'), ensureCompanyId, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const companyId = req.company_id;

    // Get employee record with order count
    const [employees] = await pool.query(
      `SELECT e.id, e.user_id, e.status, u.name, u.email,
              COUNT(o.id) as order_count
       FROM employees e
       INNER JOIN users u ON e.user_id = u.id
       LEFT JOIN orders o ON e.id = o.assigned_employee_id
       WHERE e.id = ? AND e.company_id = ?
       GROUP BY e.id`,
      [id, companyId]
    );

    if (employees.length === 0) {
      return res.status(404).json({ message: 'Zamestnanec nenájdený.' });
    }

    const employee = employees[0];

    // Only allow deletion from inactive status
    if (employee.status !== 'inactive') {
      return res.status(400).json({
        message: `Zamestnanec môže byť vymazaný len ak je deaktivovaný. Aktuálny status: ${employee.status}`
      });
    }

    // Warn if employee has orders
    if (employee.order_count > 0) {
      return res.status(400).json({
        message: `Zamestnanec má ${employee.order_count} zákaziek. Nemôže byť natrvalo vymazaný. Ponechajte ho ako deaktivovaného.`
      });
    }

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Delete notifications for this user (FK constraint)
      await connection.query(
        'DELETE FROM notifications WHERE user_id = ? OR related_user_id = ? OR related_employee_id = ?',
        [employee.user_id, employee.user_id, id]
      );

      // Delete activity logs for this user (FK constraint)
      await connection.query(
        'DELETE FROM activity_logs WHERE user_id = ?',
        [employee.user_id]
      );

      // Delete employee record
      await connection.query(
        'DELETE FROM employees WHERE id = ? AND company_id = ?',
        [id, companyId]
      );

      // Delete user account
      await connection.query(
        'DELETE FROM users WHERE id = ?',
        [employee.user_id]
      );

      // Commit transaction
      await connection.commit();
      connection.release();

      // Log activity
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];

      await logActivity(
        userId,
        'employee.delete_permanent',
        'employee',
        parseInt(id),
        { name: employee.name, email: employee.email },
        companyId,
        ipAddress,
        userAgent
      );

      res.json({
        message: 'Zamestnanec natrvalo vymazaný.',
        deletedEmployee: {
          name: employee.name,
          email: employee.email
        }
      });

    } catch (err) {
      await connection.rollback();
      connection.release();
      throw err;
    }
}));

// POST /api/employees/:id/resend-credentials - Resend default password to employee
router.post('/:id/resend-credentials', verifyToken, requireRole('companyadmin'), ensureCompanyId, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const companyId = req.company_id;

    // Get employee record
    const [employees] = await pool.query(
      `SELECT e.id, e.user_id, e.status, e.must_change_password, e.default_password_hash,
              u.name, u.email
       FROM employees e
       INNER JOIN users u ON e.user_id = u.id
       WHERE e.id = ? AND e.company_id = ?`,
      [id, companyId]
    );

    if (employees.length === 0) {
      return res.status(404).json({ message: 'Zamestnanec nenájdený.' });
    }

    const employee = employees[0];

    // Only allow for status 'created'
    if (employee.status !== 'created') {
      return res.status(400).json({
        message: `Nie je možné znovu poslať prihlasovacie údaje. Zamestnanec už zmenil heslo. Status: ${employee.status}`
      });
    }

    if (!employee.must_change_password || !employee.default_password_hash) {
      return res.status(400).json({
        message: 'Zamestnanec už zmenil heslo.'
      });
    }

    // In production, this would send an email with the default password
    // For now, we'll just send a notification to the employee
    // TODO (FÁZA 8): Send email with credentials

    // Send notification to employee
    await createNotification(
      employee.user_id,
      'credentials_resent',
      'Prihlasovacie údaje boli znovu odoslané',
      'Administrátor vám znovu odoslal prihlasovacie údaje. Skontrolujte svoj email.',
      userId,
      parseInt(id)
    );

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await logActivity(
      userId,
      'employee.resend_credentials',
      'employee',
      parseInt(id),
      { name: employee.name, email: employee.email },
      companyId,
      ipAddress,
      userAgent
    );

    res.json({
      message: 'Prihlasovacie údaje boli znovu odoslané zamestnancovi.',
      // In development, return the email so admin knows where it was "sent"
      email: employee.email,
      note: 'V produkcii by bol odoslaný email s prihlasovacími údajmi.'
    });
}));

export default router;
