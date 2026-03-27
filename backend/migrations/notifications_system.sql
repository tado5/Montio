-- ==========================================
-- MIGRATION: Employee Lifecycle & Notifications System
-- Date: 2026-03-27
-- Description: Adds employee status flow, password change tracking, and notifications
-- ==========================================

-- 1. Extend employees.status ENUM to include lifecycle states
ALTER TABLE employees
MODIFY COLUMN status ENUM('created', 'pending_approval', 'active', 'inactive', 'deleted')
DEFAULT 'created';

-- 2. Add must_change_password flag for default password tracking
ALTER TABLE employees
ADD COLUMN must_change_password TINYINT(1) DEFAULT 0
AFTER status;

-- 3. Add default_password_hash for storing temporary password
ALTER TABLE employees
ADD COLUMN default_password_hash VARCHAR(255) NULL
AFTER must_change_password;

-- 4. Create notifications table
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type VARCHAR(50) NOT NULL COMMENT 'employee_created, employee_approved, employee_deactivated, password_changed, etc.',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  related_user_id INT NULL COMMENT 'ID of related user (e.g., employee who triggered notification)',
  related_employee_id INT NULL COMMENT 'ID of related employee',
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (related_user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (related_employee_id) REFERENCES employees(id) ON DELETE SET NULL,

  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at),
  INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- MIGRATION NOTES:
-- ==========================================
--
-- Employee Status Flow:
-- 1. created - Employee created by company admin with default password
-- 2. pending_approval - Employee changed password, waiting for admin approval
-- 3. active - Admin approved, employee can work normally
-- 4. inactive - Deactivated by admin, employee can login (read-only)
-- 5. deleted - Hard delete (only possible from inactive state)
--
-- Notification Types:
-- - employee_created: Notify admin when employee is created
-- - password_changed: Notify admin when employee changes default password
-- - employee_approved: Notify employee when admin approves them
-- - employee_deactivated: Notify employee when deactivated
-- - employee_reactivated: Notify employee when reactivated
-- - employee_deleted: Notify employee before deletion (if needed)
--
-- TODO (FÁZA 8 - Email Notifications):
-- - Integrate with SendGrid/Mailgun for email delivery
-- - Email templates for each notification type
-- - User preference for email vs in-app notifications
-- - Batch digest emails (daily/weekly summaries)
-- - Email verification on registration
--
-- ==========================================
