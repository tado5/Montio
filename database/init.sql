-- MONTIO APP - Database Initialization Script
-- Local Development Environment

-- Users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('superadmin','companyadmin','employee') NOT NULL,
  `company_id` INT NULL,
  `theme` ENUM('light','dark') DEFAULT 'light',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Companies table
CREATE TABLE IF NOT EXISTS `companies` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `public_id` VARCHAR(36) UNIQUE,
  `email` VARCHAR(255),
  `name` VARCHAR(255) NOT NULL,
  `logo_url` TEXT,
  `ico` VARCHAR(20),
  `dic` VARCHAR(20),
  `address` TEXT,
  `billing_data` JSON,
  `invite_token` VARCHAR(255) UNIQUE,
  `status` ENUM('pending','active','inactive') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Order Types table
CREATE TABLE IF NOT EXISTS `order_types` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `company_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `default_checklist` JSON NOT NULL,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Employees table
CREATE TABLE IF NOT EXISTS `employees` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `company_id` INT NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20),
  `position` VARCHAR(100),
  `status` ENUM('active','inactive') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Orders table
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `company_id` INT NOT NULL,
  `order_type_id` INT NOT NULL,
  `order_number` VARCHAR(50) UNIQUE NOT NULL,
  `client_name` VARCHAR(255) NOT NULL,
  `client_email` VARCHAR(255),
  `client_phone` VARCHAR(20),
  `client_address` TEXT,
  `assigned_employee_id` INT,
  `scheduled_date` DATE,
  `status` ENUM('survey','quote','assigned','in_progress','completed','cancelled') DEFAULT 'survey',
  `total_price` DECIMAL(10,2),
  `notes` TEXT,
  `unique_link` VARCHAR(255) UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`),
  FOREIGN KEY (`order_type_id`) REFERENCES `order_types`(`id`),
  FOREIGN KEY (`assigned_employee_id`) REFERENCES `employees`(`id`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Order Stages table
CREATE TABLE IF NOT EXISTS `order_stages` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `order_id` INT NOT NULL,
  `stage` ENUM('survey','quote','installation','completion') NOT NULL,
  `checklist_data` JSON,
  `photos` JSON,
  `signature_data` TEXT,
  `pdf_url` TEXT,
  `completed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Invoices table
CREATE TABLE IF NOT EXISTS `invoices` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `company_id` INT NOT NULL,
  `order_id` INT NOT NULL,
  `invoice_number` VARCHAR(50) UNIQUE NOT NULL,
  `issue_date` DATE NOT NULL,
  `due_date` DATE NOT NULL,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `vat_amount` DECIMAL(10,2) NOT NULL,
  `status` ENUM('pending','paid','overdue','cancelled') DEFAULT 'pending',
  `pdf_url` TEXT,
  `qr_code_data` TEXT,
  `paid_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`),
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Activity Logs table (Audit Trail)
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT NULL,
  `company_id` INT NULL,
  `action` VARCHAR(100) NOT NULL,
  `entity_type` VARCHAR(50) NOT NULL,
  `entity_id` INT NULL,
  `details` JSON,
  `ip_address` VARCHAR(45),
  `user_agent` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_company_id` (`company_id`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_entity` (`entity_type`, `entity_id`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create test company
INSERT INTO `companies` (`name`, `ico`, `dic`, `address`, `invite_token`, `status`)
VALUES ('Test Firma s.r.o.', '12345678', 'SK2020123456', 'Testovacia 1, 811 01 Bratislava', 'test-invite-token-123', 'active');

-- Insert test users for development
-- Super Admin (password: admin123)
INSERT INTO `users` (`email`, `password_hash`, `role`, `company_id`)
VALUES ('admin@montio.sk', '$2a$10$NEFeeSV5VkIRzSSvkB92Beu4J4zfjajVvDsrZ2PUs7eL.0ujnj0e2', 'superadmin', NULL);

-- Company Admin (password: company123)
INSERT INTO `users` (`email`, `password_hash`, `role`, `company_id`)
VALUES ('company@montio.sk', '$2a$10$l5rtIgkeos2IuyCQKie0YO1LCCBCuPrF4ERkNB1ISeM5w69oXD6p6', 'companyadmin', 1);

-- Employee (password: employee123)
INSERT INTO `users` (`email`, `password_hash`, `role`, `company_id`)
VALUES ('employee@montio.sk', '$2a$10$ILZT4CifUZdBNKHWaMCdvOo9rn1Ljjs.U9USYuNZfjURWOYLMJbRi', 'employee', 1);

-- Create employee record for employee user
INSERT INTO `employees` (`user_id`, `company_id`, `first_name`, `last_name`, `phone`, `position`, `status`)
VALUES (3, 1, 'Jozef', 'Montér', '+421900123456', 'Technik', 'active');
