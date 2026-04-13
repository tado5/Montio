-- ============================================================================
-- MONTIO v1.11.0 - Simple Production Migration (Test Data Only)
-- Date: 2026-04-13
-- Purpose: Add avatar_url column and ensure schema for refactored code
-- ============================================================================

-- NOTE: This is safe for test data only production database

-- ============================================================================
-- 1. ADD AVATAR_URL TO USERS
-- ============================================================================

ALTER TABLE `users`
ADD COLUMN IF NOT EXISTS `avatar_url` TEXT NULL AFTER `theme`;

ALTER TABLE `users`
ADD COLUMN IF NOT EXISTS `name` VARCHAR(255) NULL AFTER `role`;

ALTER TABLE `users`
ADD COLUMN IF NOT EXISTS `position` VARCHAR(255) NULL AFTER `name`;

-- Set default positions for existing users
UPDATE `users`
SET `position` = CASE
  WHEN `role` = 'superadmin' THEN 'Administrátor systému'
  WHEN `role` = 'companyadmin' THEN 'Majiteľ firmy'
  WHEN `role` = 'employee' THEN 'Zamestnanec'
  ELSE 'Používateľ'
END
WHERE `position` IS NULL OR `position` = '';

-- Set default name from email
UPDATE `users`
SET `name` = SUBSTRING_INDEX(`email`, '@', 1)
WHERE `name` IS NULL OR `name` = '';

-- ============================================================================
-- 2. ADD AVATAR_URL TO EMPLOYEES
-- ============================================================================

ALTER TABLE `employees`
ADD COLUMN IF NOT EXISTS `avatar_url` TEXT NULL;

-- ============================================================================
-- 3. VERIFY COMPANIES JSON COLUMNS
-- ============================================================================

ALTER TABLE `companies`
ADD COLUMN IF NOT EXISTS `billing_data` JSON NULL;

ALTER TABLE `companies`
ADD COLUMN IF NOT EXISTS `financial_data` JSON NULL;

ALTER TABLE `companies`
ADD COLUMN IF NOT EXISTS `contact_data` JSON NULL;

ALTER TABLE `companies`
ADD COLUMN IF NOT EXISTS `invoice_settings` JSON NULL;

-- ============================================================================
-- 4. VERIFICATION
-- ============================================================================

SELECT '✅ Migration completed!' AS status;

SELECT 'Users table:' AS info;
SHOW COLUMNS FROM users LIKE '%avatar%';
SHOW COLUMNS FROM users LIKE '%name%';
SHOW COLUMNS FROM users LIKE '%position%';

SELECT 'Employees table:' AS info;
SHOW COLUMNS FROM employees LIKE '%avatar%';

SELECT 'Companies table:' AS info;
SHOW COLUMNS FROM companies LIKE '%data%';
SHOW COLUMNS FROM companies LIKE '%invoice%';

SELECT CONCAT('Total users: ', COUNT(*)) AS count FROM users;
SELECT CONCAT('Total companies: ', COUNT(*)) AS count FROM companies;
SELECT CONCAT('Total employees: ', COUNT(*)) AS count FROM employees;
