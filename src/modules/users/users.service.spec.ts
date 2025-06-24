import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, ChangePasswordDto } from './dto/update-user.dto';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      isActive: true,
    };

    it('should create a new user successfully', async () => {
      const result = await service.create(createUserDto);

      expect(result).toBeDefined();
      expect(result.email).toBe(createUserDto.email);
      expect(result.username).toBe(createUserDto.username);
      expect(result.firstName).toBe(createUserDto.firstName);
      expect(result.lastName).toBe(createUserDto.lastName);
      expect(result.isActive).toBe(true);
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(result).not.toHaveProperty('password'); // Password should not be returned
    });

    it('should throw ConflictException when email already exists', async () => {
      await service.create(createUserDto);

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when username already exists', async () => {
      await service.create(createUserDto);

      const duplicateUsernameDto = {
        ...createUserDto,
        email: 'different@example.com',
      };

      await expect(service.create(duplicateUsernameDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('should return a user when found', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      const createdUser = await service.create(createUserDto);
      const foundUser = await service.findOne(createdUser.id);

      expect(foundUser).toBeDefined();
      expect(foundUser.id).toBe(createdUser.id);
      expect(foundUser.email).toBe(createdUser.email);
    });

    it('should throw NotFoundException when user not found', async () => {
      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      const createdUser = await service.create(createUserDto);
      
      const updateUserDto: UpdateUserDto = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      const updatedUser = await service.update(createdUser.id, updateUserDto);

      expect(updatedUser.firstName).toBe('Updated');
      expect(updatedUser.lastName).toBe('Name');
      expect(updatedUser.email).toBe(createdUser.email); // Unchanged fields should remain
    });

    it('should throw NotFoundException when updating non-existent user', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'Updated',
      };

      await expect(service.update('non-existent-id', updateUserDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      const createdUser = await service.create(createUserDto);
      const result = await service.remove(createdUser.id);

      expect(result.message).toBe('User đã được xóa thành công');

      // User should still exist but be inactive
      const foundUser = await service.findOne(createdUser.id);
      expect(foundUser.isActive).toBe(false);
    });

    it('should throw NotFoundException when removing non-existent user', async () => {
      await expect(service.remove('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      const createdUser = await service.create(createUserDto);
      
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'password123',
        newPassword: 'newpassword123',
      };

      const result = await service.changePassword(createdUser.id, changePasswordDto);

      expect(result.message).toBe('Password đã được thay đổi thành công');
    });

    it('should throw BadRequestException when current password is wrong', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      const createdUser = await service.create(createUserDto);
      
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123',
      };

      await expect(service.changePassword(createdUser.id, changePasswordDto)).rejects.toThrow(BadRequestException);
    });
  });
});
