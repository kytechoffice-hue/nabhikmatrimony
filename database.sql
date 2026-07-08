-- Database dump for Nabhik Matrimony application
-- Generated: 2026-07-07
-- This file creates the application database (if needed), the main state table used by the app,
-- and optional normalized `profiles` table for convenience.

-- Create database if needed. Replace `your_mysql_database` with your hosting database name.
CREATE DATABASE IF NOT EXISTS `your_mysql_database` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `your_mysql_database`;

-- Primary application storage table used by the Node app: stores JSON blobs under string keys
CREATE TABLE IF NOT EXISTS `nabhik_state` (
  `key` VARCHAR(255) NOT NULL PRIMARY KEY,
  `value` LONGTEXT NOT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed minimal keys the application expects (profiles stored as JSON array; currentUser stored as JSON or null)
REPLACE INTO `nabhik_state` (`key`, `value`) VALUES
  ('profiles', '[]'),
  ('currentUser', 'null'),
  ('settings', '{}');

-- Optional: a normalized profiles table (NOT required by the application but useful for queries and reporting)
-- You may remove or ignore this section if you prefer the app's JSON-based storage.
CREATE TABLE IF NOT EXISTS `profiles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) DEFAULT NULL,
  `username` VARCHAR(100) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `mobile` VARCHAR(32) DEFAULT NULL,
  `password` VARCHAR(255) DEFAULT NULL,
  `gender` VARCHAR(32) DEFAULT NULL,
  `dob` DATE DEFAULT NULL,
  `location` VARCHAR(255) DEFAULT NULL,
  `photo` VARCHAR(1024) DEFAULT NULL,
  `verified` TINYINT(1) DEFAULT 0,
  `membership` VARCHAR(50) DEFAULT 'Free',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (`username`),
  INDEX (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Example insert for a sample admin. Do not commit real credentials or plain production passwords.
-- INSERT INTO `profiles` (`name`,`username`,`email`,`password`,`gender`,`verified`,`membership`) VALUES
-- ('Sample Admin','sample_admin','admin@example.com','change-this-password','Male',1,'Free');

-- Notes:
-- 1) The application uses the `nabhik_state` table to store JSON blobs under keys such as 'profiles' and 'currentUser'.
-- 2) If you prefer to use the normalized `profiles` table, you can migrate data from `nabhik_state`.`profiles` JSON into `profiles` rows.
-- 3) Ensure the MySQL user the app uses has CREATE/INSERT/UPDATE/SELECT privileges on this database.
-- 4) If your hosting provider requires a different database name, ALTER the statements above accordingly.

-- End of dump
