import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { ChangePasswordDto, UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

/**
 * Users Controller
 *
 * Controller xử lý HTTP requests cho User CRUD operations
 * Định nghĩa các endpoints và routing
 */

@ApiTags('users')
@Controller('users')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * POST /users
   * Tạo user mới
   *
   * Request Flow:
   * 1. Client gửi POST request với user data trong body
   * 2. ValidationPipe validate CreateUserDto
   * 3. Controller gọi service.create()
   * 4. Service xử lý business logic và lưu data
   * 5. Trả về user mới tạo (201 Created)
   *
   * Error Handling:
   * - 400 Bad Request: Validation errors
   * - 409 Conflict: Email/username đã tồn tại
   */
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    schema: {
      example: {
        id: 'uuid-string',
        email: 'john.doe@example.com',
        username: 'johndoe',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        createdAt: '2025-06-24T16:00:00.000Z',
        updatedAt: '2025-06-24T16:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Email or username already exists' })
  @ApiBody({ type: CreateUserDto })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   * GET /users
   * Lấy danh sách users với pagination và filter
   *
   * Request Flow:
   * 1. Client gửi GET request với query parameters
   * 2. ValidationPipe validate QueryUserDto
   * 3. Controller gọi service.findAll()
   * 4. Service xử lý filter, sort, pagination
   * 5. Trả về danh sách users với metadata (200 OK)
   *
   * Query Parameters:
   * - page: Trang hiện tại (default: 1)
   * - limit: Số items per page (default: 10)
   * - search: Tìm kiếm theo email, username, name
   * - isActive: Filter theo trạng thái active
   * - sortBy: Field để sort (default: createdAt)
   * - sortOrder: asc hoặc desc (default: desc)
   */
  @ApiOperation({ summary: 'Get all users with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: 'uuid-string',
            email: 'john.doe@example.com',
            username: 'johndoe',
            firstName: 'John',
            lastName: 'Doe',
            isActive: true,
            createdAt: '2025-06-24T16:00:00.000Z',
            updatedAt: '2025-06-24T16:00:00.000Z',
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    },
  })
  @Get()
  async findAll(@Query() queryDto: QueryUserDto) {
    return this.usersService.findAll(queryDto);
  }

  /**
   * GET /users/:id
   * Lấy thông tin user theo ID
   *
   * Request Flow:
   * 1. Client gửi GET request với user ID trong URL
   * 2. Controller extract ID từ params
   * 3. Controller gọi service.findOne()
   * 4. Service tìm user theo ID
   * 5. Trả về user info (200 OK)
   *
   * Error Handling:
   * - 404 Not Found: User không tồn tại
   */
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', example: 'uuid-string' })
  @ApiResponse({
    status: 200,
    description: 'User found successfully',
    schema: {
      example: {
        id: 'uuid-string',
        email: 'john.doe@example.com',
        username: 'johndoe',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        createdAt: '2025-06-24T16:00:00.000Z',
        updatedAt: '2025-06-24T16:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  /**
   * PATCH /users/:id
   * Cập nhật thông tin user
   *
   * Request Flow:
   * 1. Client gửi PATCH request với user ID và update data
   * 2. ValidationPipe validate UpdateUserDto
   * 3. Controller gọi service.update()
   * 4. Service validate và cập nhật user
   * 5. Trả về user đã cập nhật (200 OK)
   *
   * Error Handling:
   * - 400 Bad Request: Validation errors
   * - 404 Not Found: User không tồn tại
   * - 409 Conflict: Email/username mới đã tồn tại
   */
  @ApiOperation({ summary: 'Update user information' })
  @ApiParam({ name: 'id', description: 'User ID', example: 'uuid-string' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    schema: {
      example: {
        id: 'uuid-string',
        email: 'john.doe@example.com',
        username: 'johndoe',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        createdAt: '2025-06-24T16:00:00.000Z',
        updatedAt: '2025-06-24T16:05:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Email or username already exists' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * DELETE /users/:id
   * Xóa user (soft delete)
   *
   * Request Flow:
   * 1. Client gửi DELETE request với user ID
   * 2. Controller gọi service.remove()
   * 3. Service set isActive = false
   * 4. Trả về success message (200 OK)
   *
   * Error Handling:
   * - 404 Not Found: User không tồn tại
   */
  @ApiOperation({ summary: 'Delete user (soft delete)' })
  @ApiParam({ name: 'id', description: 'User ID', example: 'uuid-string' })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
    schema: {
      example: {
        message: 'User đã được xóa thành công',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  /**
   * DELETE /users/:id/hard
   * Xóa user hoàn toàn (hard delete)
   *
   * Request Flow:
   * 1. Client gửi DELETE request với user ID
   * 2. Controller gọi service.hardRemove()
   * 3. Service xóa user khỏi database
   * 4. Trả về success message (200 OK)
   *
   * Error Handling:
   * - 404 Not Found: User không tồn tại
   */
  @ApiOperation({ summary: 'Permanently delete user (hard delete)' })
  @ApiParam({ name: 'id', description: 'User ID', example: 'uuid-string' })
  @ApiResponse({
    status: 200,
    description: 'User permanently deleted',
    schema: {
      example: {
        message: 'User đã được xóa hoàn toàn',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Delete(':id/hard')
  async hardRemove(@Param('id') id: string) {
    return this.usersService.hardRemove(id);
  }

  /**
   * PATCH /users/:id/password
   * Đổi password user
   *
   * Request Flow:
   * 1. Client gửi PATCH request với current và new password
   * 2. ValidationPipe validate ChangePasswordDto
   * 3. Controller gọi service.changePassword()
   * 4. Service verify current password và update new password
   * 5. Trả về success message (200 OK)
   *
   * Error Handling:
   * - 400 Bad Request: Current password sai hoặc validation errors
   * - 404 Not Found: User không tồn tại
   */
  @ApiOperation({ summary: 'Change user password' })
  @ApiParam({ name: 'id', description: 'User ID', example: 'uuid-string' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    schema: {
      example: {
        message: 'Password đã được thay đổi thành công',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Current password is incorrect or validation error',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Patch(':id/password')
  async changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(id, changePasswordDto);
  }
}
