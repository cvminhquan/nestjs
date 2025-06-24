import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

/**
 * Users Module
 *
 * Module tổ chức và quản lý các components liên quan đến User
 *
 * Architecture:
 * - Controller: Xử lý HTTP requests/responses
 * - Service: Chứa business logic
 * - DTOs: Validate và transform data
 * - Entity: Định nghĩa data structure
 *
 * Module này có thể được import vào các modules khác
 * để sử dụng UsersService (ví dụ: AuthModule)
 */

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Export để các modules khác có thể sử dụng
})
export class UsersModule {}
