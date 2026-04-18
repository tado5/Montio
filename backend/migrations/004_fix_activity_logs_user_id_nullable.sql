-- Fix activity_logs.user_id to allow NULL for public actions (client signatures)
-- This allows logging activities from non-authenticated users (e.g., client signing quote)

ALTER TABLE `activity_logs`
MODIFY COLUMN `user_id` INT NULL;
