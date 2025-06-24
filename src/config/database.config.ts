import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * Database Configuration
 *
 * Cấu hình kết nối MySQL database cho TypeORM
 * Hỗ trợ cả development và production environments
 */

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env['DB_HOST'] || 'localhost',
  port: parseInt(process.env['DB_PORT'] || '3306'),
  username: process.env['DB_USERNAME'] || 'root',
  password: process.env['DB_PASSWORD'] || '',
  database: process.env['DB_NAME'] || 'travelticket',

  // Entity configuration
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],

  // Development settings - Tắt synchronize để tránh duplicate index
  synchronize: false, // Tắt auto-sync để tránh lỗi duplicate index
  dropSchema: false, // Tắt drop schema
  logging: process.env['NODE_ENV'] === 'development', // Enable logging in development

  // MySQL specific options
  charset: 'utf8mb4',
  timezone: '+00:00',

  // Connection pool settings (MySQL2 compatible)
  extra: {
    connectionLimit: 10,
  },

  // Migration settings
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  migrationsRun: true, // Auto-run migrations on startup

  // SSL configuration for production
  ssl:
    process.env['NODE_ENV'] === 'production'
      ? {
          rejectUnauthorized: false,
        }
      : false,
};
