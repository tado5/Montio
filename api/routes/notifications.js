import express from 'express';
import pool from '../config/db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// ==========================================
// NOTIFICATIONS API ENDPOINTS
// ==========================================
//
// TODO (FÁZA 8 - Email Notifications):
// - Add email delivery when notification is created
// - Integrate SendGrid/Mailgun API
// - User preferences for email vs in-app
// - Batch digest emails
// - Email templates for each notification type
//
// ==========================================

// GET /api/notifications - Get all notifications for current user
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { filter = 'all', limit = 50, offset = 0 } = req.query;

    let whereClause = 'WHERE n.user_id = ?';
    const params = [userId];

    // Apply filter
    if (filter === 'unread') {
      whereClause += ' AND n.is_read = 0';
    } else if (filter === 'read') {
      whereClause += ' AND n.is_read = 1';
    }

    // Get notifications with related user info
    const [notifications] = await pool.query(
      `SELECT
        n.id,
        n.type,
        n.title,
        n.message,
        n.is_read,
        n.created_at,
        n.read_at,
        ru.name as related_user_name,
        ru.email as related_user_email,
        e.first_name as related_employee_first_name,
        e.last_name as related_employee_last_name
      FROM notifications n
      LEFT JOIN users ru ON n.related_user_id = ru.id
      LEFT JOIN employees e ON n.related_employee_id = e.id
      ${whereClause}
      ORDER BY n.created_at DESC
      LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    // Get total count for pagination
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM notifications n ${whereClause}`,
      params
    );

    res.json({
      notifications,
      total: countResult[0].total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Chyba servera.' });
  }
});

// GET /api/notifications/unread-count - Get unread notification count
router.get('/unread-count', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [result] = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
      [userId]
    );

    res.json({ count: result[0].count });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Chyba servera.' });
  }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify notification belongs to user
    const [notifications] = await pool.query(
      'SELECT id FROM notifications WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (notifications.length === 0) {
      return res.status(404).json({ message: 'Notifikácia nenájdená.' });
    }

    // Mark as read
    await pool.query(
      'UPDATE notifications SET is_read = 1, read_at = NOW() WHERE id = ?',
      [id]
    );

    res.json({ message: 'Notifikácia označená ako prečítaná.' });

  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Chyba servera.' });
  }
});

// PUT /api/notifications/:id/unread - Mark notification as unread
router.put('/:id/unread', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify notification belongs to user
    const [notifications] = await pool.query(
      'SELECT id FROM notifications WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (notifications.length === 0) {
      return res.status(404).json({ message: 'Notifikácia nenájdená.' });
    }

    // Mark as unread
    await pool.query(
      'UPDATE notifications SET is_read = 0, read_at = NULL WHERE id = ?',
      [id]
    );

    res.json({ message: 'Notifikácia označená ako neprečítaná.' });

  } catch (error) {
    console.error('Mark notification unread error:', error);
    res.status(500).json({ message: 'Chyba servera.' });
  }
});

// PUT /api/notifications/mark-all-read - Mark all notifications as read
router.put('/mark-all-read', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    await pool.query(
      'UPDATE notifications SET is_read = 1, read_at = NOW() WHERE user_id = ? AND is_read = 0',
      [userId]
    );

    res.json({ message: 'Všetky notifikácie označené ako prečítané.' });

  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ message: 'Chyba servera.' });
  }
});

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify notification belongs to user
    const [notifications] = await pool.query(
      'SELECT id FROM notifications WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (notifications.length === 0) {
      return res.status(404).json({ message: 'Notifikácia nenájdená.' });
    }

    // Delete notification
    await pool.query('DELETE FROM notifications WHERE id = ?', [id]);

    res.json({ message: 'Notifikácia vymazaná.' });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Chyba servera.' });
  }
});

// DELETE /api/notifications/delete-all-read - Delete all read notifications
router.delete('/delete-all-read', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [result] = await pool.query(
      'DELETE FROM notifications WHERE user_id = ? AND is_read = 1',
      [userId]
    );

    res.json({
      message: 'Prečítané notifikácie vymazané.',
      deletedCount: result.affectedRows
    });

  } catch (error) {
    console.error('Delete all read error:', error);
    res.status(500).json({ message: 'Chyba servera.' });
  }
});

// ==========================================
// HELPER FUNCTION: Create Notification
// ==========================================
// This function is exported for use in other routes
// Usage: await createNotification(userId, type, title, message, relatedUserId, relatedEmployeeId)
//
// TODO (FÁZA 8):
// - Call email service after creating notification
// - Check user preferences before sending email
// - Queue email for batch sending if applicable
//
export const createNotification = async (
  userId,
  type,
  title,
  message,
  relatedUserId = null,
  relatedEmployeeId = null
) => {
  try {
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, related_user_id, related_employee_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, type, title, message, relatedUserId, relatedEmployeeId]
    );

    // TODO (FÁZA 8): Send email notification here
    // if (user.email_notifications_enabled) {
    //   await sendEmailNotification(userId, type, title, message);
    // }

  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
};

export default router;
