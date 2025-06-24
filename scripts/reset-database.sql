-- Reset Database Script
-- Xóa và tạo lại database để fix duplicate index issue

-- Drop database nếu tồn tại
DROP DATABASE IF EXISTS travelticket;

-- Tạo lại database với charset UTF8MB4
CREATE DATABASE travelticket 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Sử dụng database
USE travelticket;

-- Hiển thị kết quả
SELECT 'Database travelticket đã được tạo lại thành công!' as message;
SHOW DATABASES LIKE 'travelticket';
SHOW TABLES;
