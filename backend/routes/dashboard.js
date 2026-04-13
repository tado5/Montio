import express from 'express';
import pool from '../config/db.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { ensureCompanyId } from '../middleware/companyMiddleware.js';
import { asyncHandler } from '../utils/errorHandler.js';

const router = express.Router();

// GET /api/dashboard/stats - Get KPI stats for Company Admin
router.get('/stats', verifyToken, requireRole('companyadmin', 'employee'), ensureCompanyId, asyncHandler(async (req, res) => {
    const companyId = req.company_id;

    // Get orders statistics
    const [ordersStats] = await pool.query(
      `SELECT
        COUNT(*) as total_orders,
        SUM(CASE WHEN status IN ('survey', 'quote', 'assigned', 'in_progress') THEN 1 ELSE 0 END) as active_orders,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
        SUM(CASE WHEN status = 'completed' THEN COALESCE(total_price, 0) ELSE 0 END) as total_revenue
      FROM orders
      WHERE company_id = ?`,
      [companyId]
    );

    // Get current month revenue
    const [monthRevenueResult] = await pool.query(
      `SELECT SUM(COALESCE(total_price, 0)) as month_revenue
      FROM orders
      WHERE company_id = ?
        AND status = 'completed'
        AND YEAR(updated_at) = YEAR(CURRENT_DATE)
        AND MONTH(updated_at) = MONTH(CURRENT_DATE)`,
      [companyId]
    );

    // Get active employees count
    const [employeesCount] = await pool.query(
      `SELECT COUNT(*) as active_employees
      FROM employees
      WHERE company_id = ? AND status = 'active'`,
      [companyId]
    );

    // Get pending invoices count
    const [pendingInvoices] = await pool.query(
      `SELECT COUNT(*) as pending_invoices
      FROM invoices
      WHERE company_id = ? AND status = 'pending'`,
      [companyId]
    );

    // Get order types count
    const [orderTypesCount] = await pool.query(
      `SELECT COUNT(*) as order_types_count
      FROM order_types
      WHERE company_id = ?`,
      [companyId]
    );

    const stats = {
      orders: {
        total: ordersStats[0].total_orders || 0,
        active: ordersStats[0].active_orders || 0,
        completed: ordersStats[0].completed_orders || 0,
        cancelled: ordersStats[0].cancelled_orders || 0
      },
      revenue: {
        total: parseFloat(ordersStats[0].total_revenue || 0),
        this_month: parseFloat(monthRevenueResult[0].month_revenue || 0)
      },
      employees: {
        active: employeesCount[0].active_employees || 0
      },
      invoices: {
        pending: pendingInvoices[0].pending_invoices || 0
      },
      order_types: orderTypesCount[0].order_types_count || 0
    };

    res.json({ stats });
}));

// GET /api/dashboard/chart/revenue - Get revenue chart data (last 12 months)
router.get('/chart/revenue', verifyToken, requireRole('companyadmin'), ensureCompanyId, asyncHandler(async (req, res) => {
    const companyId = req.company_id;

    // Get revenue per month for last 12 months
    const [revenueData] = await pool.query(
      `SELECT
        DATE_FORMAT(updated_at, '%Y-%m') as month,
        SUM(COALESCE(total_price, 0)) as revenue
      FROM orders
      WHERE company_id = ?
        AND status = 'completed'
        AND updated_at >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(updated_at, '%Y-%m')
      ORDER BY month ASC`,
      [companyId]
    );

    res.json({ data: revenueData });
}));

// GET /api/dashboard/chart/order-types - Get order types chart data
router.get('/chart/order-types', verifyToken, requireRole('companyadmin'), ensureCompanyId, asyncHandler(async (req, res) => {
    const companyId = req.company_id;

    // Get top 5 order types by count
    const [orderTypesData] = await pool.query(
      `SELECT
        ot.name,
        COUNT(o.id) as count
      FROM order_types ot
      LEFT JOIN orders o ON ot.id = o.order_type_id
      WHERE ot.company_id = ?
      GROUP BY ot.id, ot.name
      ORDER BY count DESC
      LIMIT 5`,
      [companyId]
    );

    res.json({ data: orderTypesData });
}));

// GET /api/dashboard/employee - Get employee-specific dashboard data
router.get('/employee', verifyToken, requireRole('employee'), asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Get employee info
    const [employees] = await pool.query(
      'SELECT id, company_id FROM employees WHERE user_id = ?',
      [userId]
    );

    if (employees.length === 0) {
      return res.status(404).json({ message: 'Employee nenájdený.' });
    }

    const employeeId = employees[0].id;
    const companyId = employees[0].company_id;

    // Get assigned orders (upcoming and in progress)
    const [assignedOrders] = await pool.query(
      `SELECT
        o.id,
        o.order_number,
        o.client_name,
        o.scheduled_date,
        o.status,
        ot.name as order_type_name,
        ot.description as order_type_description
      FROM orders o
      LEFT JOIN order_types ot ON o.order_type_id = ot.id
      WHERE o.assigned_employee_id = ?
        AND o.status IN ('assigned', 'in_progress')
      ORDER BY o.scheduled_date ASC
      LIMIT 10`,
      [employeeId]
    );

    // Get completed orders count (this month)
    const [completedThisMonth] = await pool.query(
      `SELECT COUNT(*) as count
      FROM orders
      WHERE assigned_employee_id = ?
        AND status = 'completed'
        AND YEAR(updated_at) = YEAR(CURRENT_DATE)
        AND MONTH(updated_at) = MONTH(CURRENT_DATE)`,
      [employeeId]
    );

    // Get total completed orders
    const [totalCompleted] = await pool.query(
      `SELECT COUNT(*) as count
      FROM orders
      WHERE assigned_employee_id = ?
        AND status = 'completed'`,
      [employeeId]
    );

    // Get upcoming orders count (next 7 days)
    const [upcomingOrders] = await pool.query(
      `SELECT COUNT(*) as count
      FROM orders
      WHERE assigned_employee_id = ?
        AND status IN ('assigned', 'in_progress')
        AND scheduled_date BETWEEN CURRENT_DATE AND DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY)`,
      [employeeId]
    );

    // Get recent activity (last 5 assignments)
    const [recentActivity] = await pool.query(
      `SELECT
        o.id,
        o.order_number,
        o.client_name,
        o.scheduled_date,
        o.status,
        o.created_at,
        ot.name as order_type_name
      FROM orders o
      LEFT JOIN order_types ot ON o.order_type_id = ot.id
      WHERE o.assigned_employee_id = ?
      ORDER BY o.created_at DESC
      LIMIT 5`,
      [employeeId]
    );

    res.json({
      stats: {
        assignedOrders: assignedOrders.length,
        completedThisMonth: completedThisMonth[0].count,
        totalCompleted: totalCompleted[0].count,
        upcomingOrders: upcomingOrders[0].count
      },
      assignedOrders,
      recentActivity
    });
}));

export default router;
