import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { PaginatedUsersResponseDto, QueryUserDto } from './dto/query-user.dto';
import { ChangePasswordDto, UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

/**
 * Users Service với TypeORM
 *
 * Service chứa business logic cho User CRUD operations
 * Sử dụng TypeORM Repository pattern để tương tác với database
 */

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * CREATE - Tạo user mới
   *
   * Flow:
   * 1. Validate dữ liệu đầu vào (đã được handle bởi DTO)
   * 2. Kiểm tra email/username đã tồn tại chưa
   * 3. Hash password
   * 4. Tạo user mới với TypeORM
   * 5. Lưu vào database
   * 6. Trả về user (không có password)
   */
  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    // Kiểm tra email đã tồn tại
    const existingUserByEmail = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUserByEmail) {
      throw new ConflictException('Email đã được sử dụng');
    }

    // Kiểm tra username đã tồn tại
    const existingUserByUsername = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    });
    if (existingUserByUsername) {
      throw new ConflictException('Username đã được sử dụng');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltRounds,
    );

    // Tạo user mới
    const newUser = this.userRepository.create({
      email: createUserDto.email,
      username: createUserDto.username,
      password: hashedPassword,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      isActive: createUserDto.isActive ?? true,
    });

    // Lưu vào database
    const savedUser = await this.userRepository.save(newUser);

    // Trả về user không có password
    return savedUser.toResponseObject();
  }

  /**
   * READ - Lấy danh sách users với pagination và filter
   *
   * Flow:
   * 1. Parse query parameters
   * 2. Build TypeORM query với where conditions
   * 3. Apply search với ILike
   * 4. Apply sorting
   * 5. Apply pagination với skip/take
   * 6. Trả về kết quả với metadata
   */
  async findAll(queryDto: QueryUserDto): Promise<PaginatedUsersResponseDto> {
    const page = parseInt(queryDto.page || '1');
    const limit = parseInt(queryDto.limit || '10');
    const skip = (page - 1) * limit;

    // Build where conditions
    const whereConditions: any = {};

    // Apply isActive filter
    if (queryDto.isActive !== undefined) {
      whereConditions.isActive = queryDto.isActive;
    }

    // Build query
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // Apply where conditions
    if (Object.keys(whereConditions).length > 0) {
      queryBuilder.where(whereConditions);
    }

    // Apply search filter (MySQL uses LIKE instead of ILIKE)
    if (queryDto.search) {
      const searchTerm = `%${queryDto.search}%`;
      queryBuilder.andWhere(
        '(user.email LIKE :search OR user.username LIKE :search OR user.firstName LIKE :search OR user.lastName LIKE :search)',
        { search: searchTerm },
      );
    }

    // Apply sorting
    const sortBy = queryDto.sortBy || 'createdAt';
    const sortOrder = queryDto.sortOrder || 'DESC';
    queryBuilder.orderBy(
      `user.${sortBy}`,
      sortOrder.toUpperCase() as 'ASC' | 'DESC',
    );

    // Apply pagination and get results
    const [users, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      data: users.map(user => user.toResponseObject()),
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  /**
   * READ - Lấy user theo ID
   *
   * Flow:
   * 1. Tìm user theo ID với TypeORM
   * 2. Throw NotFoundException nếu không tìm thấy
   * 3. Trả về user (không có password)
   */
  async findOne(id: string): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User với ID ${id} không tồn tại`);
    }

    return user.toResponseObject();
  }

  /**
   * UPDATE - Cập nhật thông tin user
   *
   * Flow:
   * 1. Tìm user theo ID
   * 2. Kiểm tra email/username mới có bị trùng không (nếu có thay đổi)
   * 3. Cập nhật thông tin với TypeORM
   * 4. Lưu vào database
   * 5. Trả về user đã cập nhật
   */
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User với ID ${id} không tồn tại`);
    }

    // Kiểm tra email mới có bị trùng không
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUserByEmail = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUserByEmail && existingUserByEmail.id !== id) {
        throw new ConflictException('Email đã được sử dụng');
      }
    }

    // Kiểm tra username mới có bị trùng không
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUserByUsername = await this.userRepository.findOne({
        where: { username: updateUserDto.username },
      });
      if (existingUserByUsername && existingUserByUsername.id !== id) {
        throw new ConflictException('Username đã được sử dụng');
      }
    }

    // Cập nhật thông tin
    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);

    return updatedUser.toResponseObject();
  }

  /**
   * DELETE - Xóa user (soft delete)
   *
   * Flow:
   * 1. Tìm user theo ID
   * 2. Set isActive = false (soft delete)
   * 3. Lưu vào database
   * 4. Trả về thông báo thành công
   */
  async remove(id: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User với ID ${id} không tồn tại`);
    }

    // Soft delete - chỉ set isActive = false
    user.isActive = false;
    await this.userRepository.save(user);

    return { message: 'User đã được xóa thành công' };
  }

  /**
   * HARD DELETE - Xóa user hoàn toàn
   *
   * Flow:
   * 1. Tìm user theo ID
   * 2. Xóa khỏi database với TypeORM
   * 3. Trả về thông báo thành công
   */
  async hardRemove(id: string): Promise<{ message: string }> {
    const result = await this.userRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`User với ID ${id} không tồn tại`);
    }

    return { message: 'User đã được xóa hoàn toàn' };
  }

  /**
   * CHANGE PASSWORD - Đổi password
   *
   * Flow:
   * 1. Tìm user theo ID
   * 2. Verify current password
   * 3. Hash new password
   * 4. Cập nhật password với TypeORM
   * 5. Lưu vào database
   */
  async changePassword(
    id: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User với ID ${id} không tồn tại`);
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password không đúng');
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(
      changePasswordDto.newPassword,
      saltRounds,
    );

    // Cập nhật password
    user.password = hashedNewPassword;
    await this.userRepository.save(user);

    return { message: 'Password đã được thay đổi thành công' };
  }

  /**
   * Utility method - Tìm user theo email (dùng cho authentication)
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  /**
   * Utility method - Verify password (dùng cho authentication)
   */
  async verifyPassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
