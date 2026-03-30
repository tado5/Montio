import pool from '../config/db.js';

/**
 * Log activity to database
 * @param {number} userId - User ID who performed the action
 * @param {string} action - Action performed (e.g., 'user.login', 'order.create')
 * @param {string} entityType - Type of entity (e.g., 'user', 'order', 'company')
 * @param {number|null} entityId - ID of the entity
 * @param {object|null} details - Additional details (stored as JSON)
 * @param {number|null} companyId - Company ID (if applicable)
 * @param {string|null} ipAddress - IP address
 * @param {string|null} userAgent - User agent string
 */
export const logActivity = async (
  userId,
  action,
  entityType,
  entityId = null,
  details = null,
  companyId = null,
  ipAddress = null,
  userAgent = null
) => {
  try {
    await pool.query(
      `INSERT INTO activity_logs
       (user_id, company_id, action, entity_type, entity_id, details, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        companyId,
        action,
        entityType,
        entityId,
        details ? JSON.stringify(details) : null,
        ipAddress,
        userAgent
      ]
    );
  } catch (error) {
    console.error('Activity log error:', error);
    // Don't throw - logging should not break the main operation
  }
};

/**
 * Express middleware to automatically log requests
 */
export const activityLogger = (action, entityType) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    // Override res.json to log after successful response
    res.json = function (data) {
      // Only log successful responses (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user?.id;
        const companyId = req.user?.company_id;
        const entityId = data?.id || req.params?.id || null;
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];

        if (userId) {
          logActivity(
            userId,
            action,
            entityType,
            entityId,
            { method: req.method, path: req.path },
            companyId,
            ipAddress,
            userAgent
          ).catch(err => console.error('Logging failed:', err));
        }
      }

      return originalJson(data);
    };

    next();
  };
};
