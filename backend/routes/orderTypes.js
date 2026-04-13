import express from 'express';
import pool from '../config/db.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { ensureCompanyId } from '../middleware/companyMiddleware.js';
import { asyncHandler } from '../utils/errorHandler.js';
import { parseJSON } from '../utils/validation.js';
import { logActivity } from '../middleware/logger.js';

const router = express.Router();

// GET /api/order-types - Get all order types for company
router.get('/', verifyToken, requireRole('companyadmin', 'employee'), ensureCompanyId, asyncHandler(async (req, res) => {
    const companyId = req.company_id;

    // Get order types with usage stats
    const [orderTypes] = await pool.query(
      `SELECT
        ot.id,
        ot.name,
        ot.description,
        ot.default_checklist,
        COUNT(o.id) as usage_count
      FROM order_types ot
      LEFT JOIN orders o ON ot.id = o.order_type_id
      WHERE ot.company_id = ?
      GROUP BY ot.id
      ORDER BY ot.name ASC`,
      [companyId]
    );

    // Parse JSON checklist
    const formattedOrderTypes = orderTypes.map(ot => ({
      ...ot,
      default_checklist: typeof ot.default_checklist === 'string'
        ? parseJSON(ot.default_checklist, 'default_checklist')
        : ot.default_checklist
    }));

    res.json({ orderTypes: formattedOrderTypes });
}));

// GET /api/order-types/:id - Get single order type
router.get('/:id', verifyToken, requireRole('companyadmin', 'employee'), ensureCompanyId, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const companyId = req.company_id;

    // Get order type
    const [orderTypes] = await pool.query(
      `SELECT * FROM order_types WHERE id = ? AND company_id = ?`,
      [id, companyId]
    );

    if (orderTypes.length === 0) {
      return res.status(404).json({ message: 'Typ montáže nenájdený.' });
    }

    const orderType = {
      ...orderTypes[0],
      default_checklist: typeof orderTypes[0].default_checklist === 'string'
        ? parseJSON(orderTypes[0].default_checklist, 'default_checklist')
        : orderTypes[0].default_checklist
    };

    res.json({ orderType });
}));

// POST /api/order-types - Create new order type
router.post('/', verifyToken, requireRole('companyadmin'), ensureCompanyId, asyncHandler(async (req, res) => {
    const { name, description, checklist } = req.body;
    const userId = req.user.id;
    const companyId = req.company_id;

    if (!name || !checklist || !Array.isArray(checklist)) {
      return res.status(400).json({ message: 'Názov a checklist sú povinné.' });
    }

    // Create order type
    const [result] = await pool.query(
      `INSERT INTO order_types (company_id, name, description, default_checklist)
       VALUES (?, ?, ?, ?)`,
      [companyId, name, description || null, JSON.stringify(checklist)]
    );

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await logActivity(
      userId,
      'order_type.create',
      'order_type',
      result.insertId,
      { name, checklist_items: checklist.length },
      companyId,
      ipAddress,
      userAgent
    );

    res.status(201).json({
      message: 'Typ montáže vytvorený.',
      orderType: {
        id: result.insertId,
        name,
        description,
        default_checklist: checklist
      }
    });
}));

// PUT /api/order-types/:id - Update order type
router.put('/:id', verifyToken, requireRole('companyadmin'), ensureCompanyId, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, checklist } = req.body;
    const userId = req.user.id;
    const companyId = req.company_id;

    if (!name || !checklist || !Array.isArray(checklist)) {
      return res.status(400).json({ message: 'Názov a checklist sú povinné.' });
    }

    // Check if order type exists and belongs to user's company
    const [existing] = await pool.query(
      'SELECT id FROM order_types WHERE id = ? AND company_id = ?',
      [id, companyId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Typ montáže nenájdený.' });
    }

    // Update order type
    await pool.query(
      `UPDATE order_types
       SET name = ?, description = ?, default_checklist = ?
       WHERE id = ? AND company_id = ?`,
      [name, description || null, JSON.stringify(checklist), id, companyId]
    );

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await logActivity(
      userId,
      'order_type.update',
      'order_type',
      parseInt(id),
      { name, checklist_items: checklist.length },
      companyId,
      ipAddress,
      userAgent
    );

    res.json({
      message: 'Typ montáže aktualizovaný.',
      orderType: {
        id: parseInt(id),
        name,
        description,
        default_checklist: checklist
      }
    });
}));

// DELETE /api/order-types/:id - Delete order type
router.delete('/:id', verifyToken, requireRole('companyadmin'), ensureCompanyId, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const companyId = req.company_id;

    // Check if order type exists and belongs to user's company
    const [existing] = await pool.query(
      'SELECT id, name FROM order_types WHERE id = ? AND company_id = ?',
      [id, companyId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Typ montáže nenájdený.' });
    }

    // Check if order type is used in any orders
    const [ordersCount] = await pool.query(
      'SELECT COUNT(*) as count FROM orders WHERE order_type_id = ?',
      [id]
    );

    if (ordersCount[0].count > 0) {
      return res.status(400).json({
        message: `Nemožno vymazať. Tento typ montáže je použitý v ${ordersCount[0].count} zákazkách.`
      });
    }

    const orderTypeName = existing[0].name;

    // Delete order type
    await pool.query(
      'DELETE FROM order_types WHERE id = ? AND company_id = ?',
      [id, companyId]
    );

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await logActivity(
      userId,
      'order_type.delete',
      'order_type',
      parseInt(id),
      { name: orderTypeName },
      companyId,
      ipAddress,
      userAgent
    );

    res.json({ message: 'Typ montáže vymazaný.' });
}));

export default router;
