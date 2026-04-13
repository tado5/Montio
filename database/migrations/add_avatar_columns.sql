-- Migration: Add avatar support to users table
-- Date: 2026-04-13
-- Description: Adds avatar_url, name, and position columns to users table for profile customization

ALTER TABLE `users`
ADD COLUMN `name` VARCHAR(255) NULL AFTER `role`,
ADD COLUMN `position` VARCHAR(255) NULL AFTER `name`,
ADD COLUMN `avatar_url` TEXT NULL AFTER `position`;

-- Update existing users with default values if needed
UPDATE `users` SET `position` = 'Administrátor' WHERE `role` = 'superadmin' AND `position` IS NULL;
UPDATE `users` SET `position` = 'Majiteľ firmy' WHERE `role` = 'companyadmin' AND `position` IS NULL;
UPDATE `users` SET `position` = 'Zamestnanec' WHERE `role` = 'employee' AND `position` IS NULL;
