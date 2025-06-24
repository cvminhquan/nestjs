-- MySQL Database Setup Script
-- Tạo database và user cho ứng dụng NestJS

-- Tạo database
CREATE DATABASE IF NOT EXISTS travelticket 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Sử dụng database
USE travelticket;

-- Tạo user cho ứng dụng (optional, có thể dùng root)
-- CREATE USER IF NOT EXISTS 'nestjs_user'@'localhost' IDENTIFIED BY 'nestjs_password';
-- GRANT ALL PRIVILEGES ON travelticket.* TO 'nestjs_user'@'localhost';
-- FLUSH PRIVILEGES;

-- Hiển thị thông tin database
SHOW DATABASES;
SELECT DATABASE();
SHOW TABLES;
