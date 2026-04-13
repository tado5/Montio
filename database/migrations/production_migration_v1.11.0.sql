-- ============================================================================
-- MONTIO v1.11.0 - Production Migration Script
-- Date: 2026-04-13
-- Purpose: Add avatar_url column and ensure all schema updates for refactored code
-- ============================================================================

-- IMPORTANT: Backup your database before running this migration!
-- mysqldump -u root -p montio_db > backup_before_v1.11.0_$(date +%Y%m%d_%H%M%S).sql

-- ============================================================================
-- 1. ADD AVATAR_URL COLUMN TO USERS TABLE
-- ============================================================================

-- Check if avatar_url column exists, add if not
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'users'
  AND COLUMN_NAME = 'avatar_url';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `users` ADD COLUMN `avatar_url` TEXT NULL AFTER `theme`',
  'SELECT "Column avatar_url already exists" AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================================
-- 2. ENSURE NAME AND POSITION COLUMNS EXIST (if not already present)
-- ============================================================================

-- Check if name column exists
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'users'
  AND COLUMN_NAME = 'name';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `users` ADD COLUMN `name` VARCHAR(255) NULL AFTER `role`',
  'SELECT "Column name already exists" AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if position column exists
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'users'
  AND COLUMN_NAME = 'position';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `users` ADD COLUMN `position` VARCHAR(255) NULL AFTER `name`',
  'SELECT "Column position already exists" AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================================
-- 3. UPDATE DEFAULT VALUES FOR EXISTING USERS
-- ============================================================================

-- Set default positions for users without one
UPDATE `users`
SET `position` = CASE
  WHEN `role` = 'superadmin' THEN 'Administrátor systému'
  WHEN `role` = 'companyadmin' THEN 'Majiteľ firmy'
  WHEN `role` = 'employee' THEN 'Zamestnanec'
  ELSE 'Používateľ'
END
WHERE `position` IS NULL OR `position` = '';

-- Set default name from email if name is empty
UPDATE `users`
SET `name` = SUBSTRING_INDEX(`email`, '@', 1)
WHERE `name` IS NULL OR `name` = '';

-- ============================================================================
-- 4. VERIFY EMPLOYEES TABLE STRUCTURE
-- ============================================================================

-- Ensure employees table has avatar_url column
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'employees'
  AND COLUMN_NAME = 'avatar_url';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `employees` ADD COLUMN `avatar_url` TEXT NULL',
  'SELECT "Column avatar_url in employees already exists" AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================================
-- 5. VERIFY COMPANIES TABLE STRUCTURE
-- ============================================================================

-- Ensure companies table has all required JSON columns
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'companies'
  AND COLUMN_NAME = 'billing_data';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `companies` ADD COLUMN `billing_data` JSON NULL',
  'SELECT "Column billing_data already exists" AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check financial_data
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'companies'
  AND COLUMN_NAME = 'financial_data';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `companies` ADD COLUMN `financial_data` JSON NULL',
  'SELECT "Column financial_data already exists" AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check contact_data
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'companies'
  AND COLUMN_NAME = 'contact_data';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `companies` ADD COLUMN `contact_data` JSON NULL',
  'SELECT "Column contact_data already exists" AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check invoice_settings
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'companies'
  AND COLUMN_NAME = 'invoice_settings';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `companies` ADD COLUMN `invoice_settings` JSON NULL',
  'SELECT "Column invoice_settings already exists" AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================================
-- 6. VERIFY UPLOADS DIRECTORIES PERMISSIONS (Manual step - see below)
-- ============================================================================

-- NOTE: After running this migration, manually verify on server:
-- mkdir -p backend/uploads/avatars
-- mkdir -p backend/uploads/logos
-- chmod 755 backend/uploads backend/uploads/avatars backend/uploads/logos
-- chown www-data:www-data backend/uploads -R

-- ============================================================================
-- 7. VERIFICATION QUERIES
-- ============================================================================

-- Show users table structure
SELECT 'Users table structure:' AS info;
DESCRIBE users;

-- Show companies table structure
SELECT 'Companies table structure:' AS info;
DESCRIBE companies;

-- Show employees table structure
SELECT 'Employees table structure:' AS info;
DESCRIBE employees;

-- Count users by role
SELECT 'Users by role:' AS info;
SELECT role, COUNT(*) as count
FROM users
GROUP BY role;

-- Count companies by status
SELECT 'Companies by status:' AS info;
SELECT status, COUNT(*) as count
FROM companies
GROUP BY status;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

SELECT '✅ Migration v1.11.0 completed successfully!' AS status;
SELECT 'Next steps:' AS info;
SELECT '1. Verify uploads directories exist and have correct permissions' AS step;
SELECT '2. Restart backend server: pm2 restart montio-backend' AS step;
SELECT '3. Test login and avatar functionality' AS step;
SELECT '4. Monitor logs: pm2 logs montio-backend' AS step;
