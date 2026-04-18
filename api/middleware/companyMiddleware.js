import pool from '../config/db.js';
import { ERROR_MESSAGES } from '../config/constants.js';

/**
 * Middleware to ensure user has a company_id and attach it to request
 * Prevents duplicate company_id lookup in every route
 */
export const ensureCompanyId = async (req, res, next) => {
  try {
    // Check if company_id is already in JWT token
    if (req.user.company_id) {
      req.company_id = req.user.company_id;
      return next();
    }

    // Fallback: Query database if not in token
    const [users] = await pool.query(
      'SELECT company_id FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!users[0]?.company_id) {
      return res.status(404).json({ message: ERROR_MESSAGES.COMPANY_NOT_FOUND });
    }

    req.company_id = users[0].company_id;
    next();
  } catch (error) {
    console.error('ensureCompanyId middleware error:', error);
    res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
  }
};

/**
 * Middleware to get employee info for current user
 */
export const ensureEmployeeId = async (req, res, next) => {
  try {
    const [employees] = await pool.query(
      'SELECT id, company_id, status FROM employees WHERE user_id = ?',
      [req.user.id]
    );

    if (employees.length === 0) {
      return res.status(404).json({ message: 'Employee nenájdený.' });
    }

    req.employee = employees[0];
    req.company_id = employees[0].company_id;
    next();
  } catch (error) {
    console.error('ensureEmployeeId middleware error:', error);
    res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
  }
};
