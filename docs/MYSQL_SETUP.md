# MySQL Database Setup Guide

## 📋 Yêu cầu

- MySQL Server 8.0+ hoặc MariaDB 10.3+
- MySQL Client hoặc MySQL Workbench

## 🚀 Cài đặt MySQL

### Windows
1. Tải MySQL từ: https://dev.mysql.com/downloads/mysql/
2. Chạy MySQL Installer
3. Chọn "Developer Default" setup
4. Thiết lập root password

### macOS
```bash
# Sử dụng Homebrew
brew install mysql
brew services start mysql

# Thiết lập bảo mật
mysql_secure_installation
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql

# Thiết lập bảo mật
sudo mysql_secure_installation
```

## 🗄️ Tạo Database

### Cách 1: Sử dụng MySQL Command Line
```bash
# Kết nối MySQL
mysql -u root -p

# Chạy script setup
source scripts/setup-mysql.sql

# Hoặc chạy từng lệnh
CREATE DATABASE IF NOT EXISTS travelticket 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE travelticket;
```

### Cách 2: Sử dụng MySQL Workbench
1. Mở MySQL Workbench
2. Kết nối đến MySQL Server
3. Tạo new schema tên "travelticket"
4. Set charset: utf8mb4, collation: utf8mb4_unicode_ci

## ⚙️ Cấu hình Environment

Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

Cập nhật thông tin database trong `.env`:
```env
# Database (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
DB_NAME=travelticket
```

## 🔧 Kiểm tra kết nối

### Test kết nối MySQL
```bash
mysql -u root -p -h localhost -P 3306 -D travelticket
```

### Test ứng dụng NestJS
```bash
# Chạy ứng dụng
npm run start:dev

# Kiểm tra logs để xem kết nối database
# Nếu thành công sẽ thấy:
# [TypeORM] Connection to MySQL database established
```

## 📊 Cấu trúc Database

Khi chạy ứng dụng lần đầu với `synchronize: true`, TypeORM sẽ tự động tạo bảng:

```sql
-- Bảng users sẽ được tạo tự động
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Indexes sẽ được tạo tự động
CREATE INDEX IDX_users_email ON users(email);
CREATE INDEX IDX_users_username ON users(username);
CREATE INDEX IDX_users_first_name_last_name ON users(first_name, last_name);
```

## 🛠️ Troubleshooting

### Lỗi kết nối
```
Error: ER_NOT_SUPPORTED_AUTH_MODE
```
**Giải pháp:**
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
```

### Lỗi charset
```
Error: ER_CHARSET_ON_COLLATION
```
**Giải pháp:** Đảm bảo database sử dụng utf8mb4:
```sql
ALTER DATABASE travelticket CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Lỗi timezone
```
Error: ER_TRUNCATED_WRONG_VALUE
```
**Giải pháp:** Cấu hình timezone trong MySQL:
```sql
SET GLOBAL time_zone = '+00:00';
```

## 📈 Performance Tips

### 1. Cấu hình MySQL cho development
Thêm vào `my.cnf` hoặc `my.ini`:
```ini
[mysqld]
innodb_buffer_pool_size = 256M
max_connections = 100
query_cache_size = 64M
query_cache_type = 1
```

### 2. Indexes cho performance
```sql
-- Thêm indexes cho search nhanh hơn
CREATE INDEX idx_users_search ON users(email, username, first_name, last_name);
CREATE INDEX idx_users_active_created ON users(is_active, created_at);
```

### 3. Connection pooling
Cấu hình trong `database.config.ts` đã được tối ưu:
```typescript
extra: {
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
}
```

## 🔒 Security Best Practices

1. **Không dùng root user cho production**
```sql
CREATE USER 'travelticket_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON travelticket.* TO 'travelticket_user'@'localhost';
```

2. **Sử dụng SSL cho production**
3. **Backup database thường xuyên**
4. **Monitor database performance**

## 📚 Tài liệu tham khảo

- [MySQL Documentation](https://dev.mysql.com/doc/)
- [TypeORM MySQL Guide](https://typeorm.io/data-source-options#mysql--mariadb-data-source-options)
- [NestJS TypeORM Integration](https://docs.nestjs.com/techniques/database)
