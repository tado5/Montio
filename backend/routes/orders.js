import express from 'express';
import pool from '../config/db.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { ensureCompanyId } from '../middleware/companyMiddleware.js';
import { asyncHandler } from '../utils/errorHandler.js';

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

export default router;
