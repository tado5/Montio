-- MONTIO APP - Databázová schéma
-- MariaDB 11.4

USE `d46895_montio`;

-- Vymazanie existujúcich tabuliek (ak existujú)
DROP TABLE IF EXISTS `invoices`;
DROP TABLE IF EXISTS `order_stages`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `employees`;
DROP TABLE IF EXISTS `order_types`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `companies`;

-- ============================================
-- TABUĽKA: companies
-- ============================================
CREATE TABLE `companies` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `logo_url` TEXT,
  `ico` VARCHAR(20),
  `dic` VARCHAR(20),
  `address` TEXT,
  `billing_data` JSON,
  `invite_token` VARCHAR(255) UNIQUE,
  `status` ENUM('pending','active') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================
-- TABUĽKA: users
-- ============================================
CREATE TABLE `users` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('superadmin','companyadmin','employee') NOT NULL,
  `company_id` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================
-- TABUĽKA: order_types
-- ============================================
CREATE TABLE `order_types` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `company_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `default_checklist` JSON NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================
-- TABUĽKA: employees
-- ============================================
CREATE TABLE `employees` (
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

-- ============================================
-- TABUĽKA: orders
-- ============================================
CREATE TABLE `orders` (
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

-- ============================================
-- TABUĽKA: order_stages
-- ============================================
CREATE TABLE `order_stages` (
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

-- ============================================
-- TABUĽKA: invoices
-- ============================================
CREATE TABLE `invoices` (
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

-- ============================================
-- POČIATOČNÉ DÁTA: Super Admin používateľ
-- ============================================
-- POZNÁMKA: Heslo je "admin123" (zmeň si ho po prvom prihlásení!)
-- Hash pre "admin123": $2a$10$XqKzPzjXYmH8xJmF7wHPcOYj6jL9KZ3vJxBxX5nXqZFqvKzPzjXYm

INSERT INTO `users` (`email`, `password_hash`, `role`, `company_id`)
VALUES ('admin@montio.sk', '$2a$10$XqKzPzjXYmH8xJmF7wHPcOYj6jL9KZ3vJxBxX5nXqZFqvKzPzjXYm', 'superadmin', NULL);

-- ============================================
-- TESTOVACIA FIRMA (pre vývoj)
-- ============================================
INSERT INTO `companies` (`name`, `ico`, `dic`, `address`, `invite_token`, `status`)
VALUES ('Test Montáže s.r.o.', '12345678', 'SK2020123456', 'Testovacia 123, Bratislava', 'test-invite-token-12345', 'pending');

-- ============================================
-- KONIEC SCHÉMY
-- ============================================

SELECT 'Databáza úspešne vytvorená!' AS Status;
SELECT COUNT(*) AS 'Počet tabuliek' FROM information_schema.tables WHERE table_schema = 'd46895_montio';
