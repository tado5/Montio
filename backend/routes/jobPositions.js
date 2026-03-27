import express from 'express';
import pool from '../config/db.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { logActivity } from '../middleware/logger.js';

const router = express.Router();

// GET /api/job-positions - Get all job positions for company
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

    // Get job positions with usage count
    const [positions] = await pool.query(
      `SELECT
        jp.id,
        jp.name,
        jp.description,
        jp.is_default,
        jp.created_at,
        COUNT(e.id) as usage_count
      FROM job_positions jp
      LEFT JOIN employees e ON jp.name = e.position AND e.company_id = jp.company_id
      WHERE jp.company_id = ?
      GROUP BY jp.id
      ORDER BY jp.is_default DESC, jp.name ASC`,
      [companyId]
    );

    res.json({ positions });

  } catch (error) {
    console.error('Get job positions error:', error);
    res.status(500).json({ message: 'Chyba servera.' });
  }
});

// POST /api/job-positions - Create new job position
router.post('/', verifyToken, requireRole('companyadmin'), async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({ message: 'Názov je povinný.' });
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

    // Check if position already exists
    const [existing] = await pool.query(
      'SELECT id FROM job_positions WHERE company_id = ? AND name = ?',
      [companyId, name]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Pozícia s týmto názvom už existuje.' });
    }

    // Create job position
    const [result] = await pool.query(
      `INSERT INTO job_positions (company_id, name, description, is_default)
       VALUES (?, ?, ?, 0)`,
      [companyId, name, description || null]
    );

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await logActivity(
      userId,
      'job_position.create',
      'job_position',
      result.insertId,
      { name, description },
      companyId,
      ipAddress,
      userAgent
    );

    res.status(201).json({
      message: 'Pozícia vytvorená.',
      position: {
        id: result.insertId,
        name,
        description,
        is_default: 0
      }
    });

  } catch (error) {
    console.error('Create job position error:', error);
    res.status(500).json({ message: 'Chyba servera.' });
  }
});

// PUT /api/job-positions/:id - Update job position
router.put('/:id', verifyToken, requireRole('companyadmin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({ message: 'Názov je povinný.' });
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

    // Check if position exists and belongs to user's company
    const [existing] = await pool.query(
      'SELECT id, is_default FROM job_positions WHERE id = ? AND company_id = ?',
      [id, companyId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Pozícia nenájdená.' });
    }

    // Check if new name already exists (excluding current position)
    const [duplicate] = await pool.query(
      'SELECT id FROM job_positions WHERE company_id = ? AND name = ? AND id != ?',
      [companyId, name, id]
    );

    if (duplicate.length > 0) {
      return res.status(400).json({ message: 'Pozícia s týmto názvom už existuje.' });
    }

    // Update job position
    await pool.query(
      `UPDATE job_positions
       SET name = ?, description = ?
       WHERE id = ? AND company_id = ?`,
      [name, description || null, id, companyId]
    );

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await logActivity(
      userId,
      'job_position.update',
      'job_position',
      parseInt(id),
      { name, description },
      companyId,
      ipAddress,
      userAgent
    );

    res.json({
      message: 'Pozícia aktualizovaná.',
      position: {
        id: parseInt(id),
        name,
        description
      }
    });

  } catch (error) {
    console.error('Update job position error:', error);
    res.status(500).json({ message: 'Chyba servera.' });
  }
});

// DELETE /api/job-positions/:id - Delete job position
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

    // Check if position exists and belongs to user's company
    const [existing] = await pool.query(
      'SELECT id, name FROM job_positions WHERE id = ? AND company_id = ?',
      [id, companyId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Pozícia nenájdená.' });
    }

    // Check if position is used by employees
    const [employeesCount] = await pool.query(
      'SELECT COUNT(*) as count FROM employees WHERE position = ? AND company_id = ?',
      [existing[0].name, companyId]
    );

    if (employeesCount[0].count > 0) {
      return res.status(400).json({
        message: `Nemožno vymazať. Táto pozícia je priradená ${employeesCount[0].count} zamestnancom.`
      });
    }

    const positionName = existing[0].name;

    // Delete job position
    await pool.query(
      'DELETE FROM job_positions WHERE id = ? AND company_id = ?',
      [id, companyId]
    );

    // Log activity
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await logActivity(
      userId,
      'job_position.delete',
      'job_position',
      parseInt(id),
      { name: positionName },
      companyId,
      ipAddress,
      userAgent
    );

    res.json({ message: 'Pozícia vymazaná.' });

  } catch (error) {
    console.error('Delete job position error:', error);
    res.status(500).json({ message: 'Chyba servera.' });
  }
});

export default router;
