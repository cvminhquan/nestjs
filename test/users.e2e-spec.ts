import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let createdUserId: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/users (POST)', () => {
    it('should create a new user', () => {
      const createUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      return request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201)
        .expect(res => {
          expect(res.body.email).toBe(createUserDto.email);
          expect(res.body.username).toBe(createUserDto.username);
          expect(res.body.firstName).toBe(createUserDto.firstName);
          expect(res.body.lastName).toBe(createUserDto.lastName);
          expect(res.body.isActive).toBe(true);
          expect(res.body.id).toBeDefined();
          expect(res.body.createdAt).toBeDefined();
          expect(res.body.updatedAt).toBeDefined();
          expect(res.body.password).toBeUndefined(); // Password should not be returned
          createdUserId = res.body.id;
        });
    });

    it('should return 400 for invalid email', () => {
      const createUserDto = {
        email: 'invalid-email',
        username: 'testuser',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      return request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(400);
    });

    it('should return 400 for missing required fields', () => {
      const createUserDto = {
        email: 'test@example.com',
        // missing username, password, firstName, lastName
      };

      return request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(400);
    });
  });

  describe('/users (GET)', () => {
    beforeEach(async () => {
      // Create a test user
      const createUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto);

      createdUserId = response.body.id;
    });

    it('should return paginated users list', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect(res => {
          expect(res.body.data).toBeDefined();
          expect(res.body.total).toBeDefined();
          expect(res.body.page).toBeDefined();
          expect(res.body.limit).toBeDefined();
          expect(res.body.totalPages).toBeDefined();
          expect(res.body.hasNext).toBeDefined();
          expect(res.body.hasPrev).toBeDefined();
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should filter users by search term', () => {
      return request(app.getHttpServer())
        .get('/users?search=test')
        .expect(200)
        .expect(res => {
          // Có thể có hoặc không có user với search term "test"
          // Nếu có thì phải match search criteria
          if (res.body.data.length > 0) {
            const user = res.body.data[0];
            expect(
              user.email.toLowerCase().includes('test') ||
                user.username.toLowerCase().includes('test') ||
                user.firstName.toLowerCase().includes('test') ||
                user.lastName.toLowerCase().includes('test'),
            ).toBe(true);
          }
          // Test structure của response
          expect(res.body.data).toBeDefined();
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should filter users by isActive status', () => {
      return request(app.getHttpServer())
        .get('/users?isActive=true')
        .expect(200)
        .expect(res => {
          res.body.data.forEach((user: any) => {
            expect(user.isActive).toBe(true);
          });
        });
    });
  });

  describe('/users/:id (GET)', () => {
    beforeEach(async () => {
      // Create a test user
      const createUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto);

      createdUserId = response.body.id;
    });

    it('should return user by id', () => {
      return request(app.getHttpServer())
        .get(`/users/${createdUserId}`)
        .expect(200)
        .expect(res => {
          expect(res.body.id).toBe(createdUserId);
          expect(res.body.email).toBe('test@example.com');
          expect(res.body.username).toBe('testuser');
          expect(res.body.password).toBeUndefined();
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .get('/users/non-existent-id')
        .expect(404);
    });
  });

  describe('/users/:id (PATCH)', () => {
    beforeEach(async () => {
      // Create a test user
      const createUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto);

      createdUserId = response.body.id;
    });

    it('should update user successfully', () => {
      const updateUserDto = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      return request(app.getHttpServer())
        .patch(`/users/${createdUserId}`)
        .send(updateUserDto)
        .expect(200)
        .expect(res => {
          expect(res.body.firstName).toBe('Updated');
          expect(res.body.lastName).toBe('Name');
          expect(res.body.email).toBe('test@example.com'); // Unchanged
        });
    });

    it('should return 404 for non-existent user', () => {
      const updateUserDto = {
        firstName: 'Updated',
      };

      return request(app.getHttpServer())
        .patch('/users/non-existent-id')
        .send(updateUserDto)
        .expect(404);
    });
  });

  describe('/users/:id (DELETE)', () => {
    beforeEach(async () => {
      // Create a test user
      const createUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto);

      createdUserId = response.body.id;
    });

    it('should soft delete user successfully', () => {
      return request(app.getHttpServer())
        .delete(`/users/${createdUserId}`)
        .expect(200)
        .expect(res => {
          expect(res.body.message).toBe('User đã được xóa thành công');
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .delete('/users/non-existent-id')
        .expect(404);
    });
  });

  describe('/users/:id/password (PATCH)', () => {
    beforeEach(async () => {
      // Create a test user
      const createUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto);

      createdUserId = response.body.id;
    });

    it('should change password successfully', () => {
      const changePasswordDto = {
        currentPassword: 'password123',
        newPassword: 'newpassword123',
      };

      return request(app.getHttpServer())
        .patch(`/users/${createdUserId}/password`)
        .send(changePasswordDto)
        .expect(200)
        .expect(res => {
          expect(res.body.message).toBe('Password đã được thay đổi thành công');
        });
    });

    it('should return 400 for wrong current password', () => {
      const changePasswordDto = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123',
      };

      return request(app.getHttpServer())
        .patch(`/users/${createdUserId}/password`)
        .send(changePasswordDto)
        .expect(400);
    });
  });
});
