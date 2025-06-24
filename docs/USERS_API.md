# Users API Documentation

## Tổng quan

API Users cung cấp đầy đủ các chức năng CRUD (Create, Read, Update, Delete) để quản lý người dùng trong hệ thống.

## Base URL
```
http://localhost:3000/users
```

## Endpoints

### 1. Tạo User Mới

**POST** `/users`

#### Request Body
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "isActive": true
}
```

#### Response (201 Created)
```json
{
  "id": "uuid-string",
  "email": "user@example.com",
  "username": "username",
  "firstName": "John",
  "lastName": "Doe",
  "isActive": true,
  "createdAt": "2025-06-24T16:00:00.000Z",
  "updatedAt": "2025-06-24T16:00:00.000Z"
}
```

#### Validation Rules
- `email`: Phải là email hợp lệ, không được trống
- `username`: 3-20 ký tự, không được trống
- `password`: Tối thiểu 6 ký tự, không được trống
- `firstName`: Tối đa 50 ký tự, không được trống
- `lastName`: Tối đa 50 ký tự, không được trống
- `isActive`: Boolean, optional (default: true)

#### Error Responses
- `400 Bad Request`: Validation errors
- `409 Conflict`: Email hoặc username đã tồn tại

---

### 2. Lấy Danh Sách Users

**GET** `/users`

#### Query Parameters
- `page`: Số trang (default: 1)
- `limit`: Số items per page (default: 10)
- `search`: Tìm kiếm theo email, username, firstName, lastName
- `isActive`: Filter theo trạng thái (true/false)
- `sortBy`: Field để sort (default: createdAt)
- `sortOrder`: asc hoặc desc (default: desc)

#### Example Request
```
GET /users?page=1&limit=10&search=john&isActive=true&sortBy=createdAt&sortOrder=desc
```

#### Response (200 OK)
```json
{
  "data": [
    {
      "id": "uuid-string",
      "email": "user@example.com",
      "username": "username",
      "firstName": "John",
      "lastName": "Doe",
      "isActive": true,
      "createdAt": "2025-06-24T16:00:00.000Z",
      "updatedAt": "2025-06-24T16:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1,
  "hasNext": false,
  "hasPrev": false
}
```

---

### 3. Lấy User Theo ID

**GET** `/users/:id`

#### Response (200 OK)
```json
{
  "id": "uuid-string",
  "email": "user@example.com",
  "username": "username",
  "firstName": "John",
  "lastName": "Doe",
  "isActive": true,
  "createdAt": "2025-06-24T16:00:00.000Z",
  "updatedAt": "2025-06-24T16:00:00.000Z"
}
```

#### Error Responses
- `404 Not Found`: User không tồn tại

---

### 4. Cập Nhật User

**PATCH** `/users/:id`

#### Request Body (tất cả fields đều optional)
```json
{
  "email": "newemail@example.com",
  "username": "newusername",
  "firstName": "Jane",
  "lastName": "Smith",
  "isActive": false
}
```

#### Response (200 OK)
```json
{
  "id": "uuid-string",
  "email": "newemail@example.com",
  "username": "newusername",
  "firstName": "Jane",
  "lastName": "Smith",
  "isActive": false,
  "createdAt": "2025-06-24T16:00:00.000Z",
  "updatedAt": "2025-06-24T16:05:00.000Z"
}
```

#### Error Responses
- `400 Bad Request`: Validation errors
- `404 Not Found`: User không tồn tại
- `409 Conflict`: Email hoặc username mới đã tồn tại

---

### 5. Xóa User (Soft Delete)

**DELETE** `/users/:id`

#### Response (200 OK)
```json
{
  "message": "User đã được xóa thành công"
}
```

#### Error Responses
- `404 Not Found`: User không tồn tại

---

### 6. Xóa User Hoàn Toàn (Hard Delete)

**DELETE** `/users/:id/hard`

#### Response (200 OK)
```json
{
  "message": "User đã được xóa hoàn toàn"
}
```

#### Error Responses
- `404 Not Found`: User không tồn tại

---

### 7. Đổi Password

**PATCH** `/users/:id/password`

#### Request Body
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

#### Response (200 OK)
```json
{
  "message": "Password đã được thay đổi thành công"
}
```

#### Error Responses
- `400 Bad Request`: Current password sai hoặc validation errors
- `404 Not Found`: User không tồn tại

---

## Data Flow và Xử Lý

### 1. Request Flow
```
Client Request → Controller → Validation → Service → Business Logic → Data Storage → Response
```

### 2. Error Handling
- Tất cả errors đều được handle và trả về format chuẩn
- Validation errors được catch bởi ValidationPipe
- Business logic errors được throw từ Service

### 3. Security
- Password được hash bằng bcrypt với salt rounds = 12
- Password không bao giờ được trả về trong response
- Validation chặt chẽ cho tất cả input data

### 4. Data Storage
- Hiện tại sử dụng in-memory storage để demo
- Trong production, sẽ thay thế bằng database (PostgreSQL, MongoDB, etc.)
- Entity design sẵn sàng cho ORM integration

### 5. Performance Considerations
- Pagination để tránh load quá nhiều data
- Search và filter được optimize
- Soft delete để preserve data integrity
- Index trên email và username (khi dùng database)

## Testing

### Unit Tests
```bash
npm run test -- users.service.spec.ts
```

### E2E Tests
```bash
npm run test:e2e -- users.e2e-spec.ts
```

### Manual Testing với curl

#### Tạo user mới
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

#### Lấy danh sách users
```bash
curl -X GET "http://localhost:3000/users?page=1&limit=10"
```

#### Lấy user theo ID
```bash
curl -X GET http://localhost:3000/users/{user-id}
```

#### Cập nhật user
```bash
curl -X PATCH http://localhost:3000/users/{user-id} \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated Name"
  }'
```

#### Đổi password
```bash
curl -X PATCH http://localhost:3000/users/{user-id}/password \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "newpassword123"
  }'
```

#### Xóa user
```bash
curl -X DELETE http://localhost:3000/users/{user-id}
```

## Phân Tích Chi Tiết Flow và Xử Lý Data

### 1. Kiến Trúc Tổng Quan

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   HTTP Client   │───▶│   Controller    │───▶│    Service      │───▶│   Data Store    │
│  (Frontend/API) │    │  (Routing &     │    │ (Business Logic)│    │  (In-Memory)    │
│                 │◀───│   Validation)   │◀───│                 │◀───│                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 2. Data Flow Chi Tiết

#### A. CREATE User Flow

```
1. Client Request
   ├── POST /users
   ├── Content-Type: application/json
   └── Body: { email, username, password, firstName, lastName, isActive? }

2. Controller Layer (users.controller.ts)
   ├── @Post() decorator maps route
   ├── ValidationPipe validates CreateUserDto
   ├── Transform data types
   └── Call usersService.create()

3. Service Layer (users.service.ts)
   ├── Check email uniqueness
   ├── Check username uniqueness
   ├── Hash password with bcrypt (salt rounds: 12)
   ├── Generate UUID for user ID
   ├── Create User entity
   ├── Save to data store
   └── Return user without password

4. Response
   ├── Status: 201 Created
   ├── Body: User object (no password)
   └── Headers: Content-Type: application/json
```

#### B. READ Users Flow (với Pagination & Filter)

```
1. Client Request
   ├── GET /users?page=1&limit=10&search=john&isActive=true&sortBy=createdAt&sortOrder=desc
   └── Query parameters validation

2. Controller Layer
   ├── @Get() decorator maps route
   ├── ValidationPipe validates QueryUserDto
   ├── Transform query params
   └── Call usersService.findAll()

3. Service Layer - Data Processing Pipeline
   ├── 1. Get all users from store
   ├── 2. Apply search filter (email, username, firstName, lastName)
   ├── 3. Apply isActive filter
   ├── 4. Apply sorting (by field + order)
   ├── 5. Calculate pagination metadata
   ├── 6. Apply pagination (skip + limit)
   └── 7. Remove passwords from results

4. Response
   ├── Status: 200 OK
   ├── Body: PaginatedUsersResponseDto
   │   ├── data: User[] (without passwords)
   │   ├── total: number
   │   ├── page: number
   │   ├── limit: number
   │   ├── totalPages: number
   │   ├── hasNext: boolean
   │   └── hasPrev: boolean
   └── Headers: Content-Type: application/json
```

#### C. UPDATE User Flow

```
1. Client Request
   ├── PATCH /users/:id
   ├── Params: { id: string }
   └── Body: UpdateUserDto (partial fields)

2. Controller Layer
   ├── @Patch(':id') decorator maps route
   ├── Extract ID from params
   ├── ValidationPipe validates UpdateUserDto
   └── Call usersService.update()

3. Service Layer - Validation & Update Pipeline
   ├── 1. Find user by ID
   ├── 2. Check if user exists
   ├── 3. Validate new email uniqueness (if changed)
   ├── 4. Validate new username uniqueness (if changed)
   ├── 5. Update user properties
   ├── 6. Set updatedAt timestamp
   └── 7. Return updated user without password

4. Response
   ├── Status: 200 OK
   ├── Body: Updated User object (no password)
   └── Headers: Content-Type: application/json
```

#### D. DELETE User Flow (Soft Delete)

```
1. Client Request
   ├── DELETE /users/:id
   └── Params: { id: string }

2. Controller Layer
   ├── @Delete(':id') decorator maps route
   ├── Extract ID from params
   └── Call usersService.remove()

3. Service Layer
   ├── 1. Find user by ID
   ├── 2. Check if user exists
   ├── 3. Set isActive = false (soft delete)
   ├── 4. Update updatedAt timestamp
   └── 5. Return success message

4. Response
   ├── Status: 200 OK
   ├── Body: { message: "User đã được xóa thành công" }
   └── Headers: Content-Type: application/json
```

### 3. Security & Data Protection

#### A. Password Security
```typescript
// Hash password với bcrypt
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Verify password
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

#### B. Data Sanitization
```typescript
// Remove password from responses
toResponseObject(): Omit<User, 'password'> {
  const { password, ...result } = this;
  return result as Omit<User, 'password'>;
}
```

#### C. Input Validation
```typescript
// DTO validation với class-validator
@IsEmail({}, { message: 'Email phải có định dạng hợp lệ' })
@IsNotEmpty({ message: 'Email không được để trống' })
email!: string;
```

### 4. Error Handling Strategy

#### A. Validation Errors (400 Bad Request)
```typescript
// Automatic validation by ValidationPipe
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
```

#### B. Business Logic Errors
```typescript
// Conflict errors (409)
if (existingUser) {
  throw new ConflictException('Email đã được sử dụng');
}

// Not found errors (404)
if (!user) {
  throw new NotFoundException('User không tồn tại');
}

// Bad request errors (400)
if (!isPasswordValid) {
  throw new BadRequestException('Current password không đúng');
}
```

### 5. Data Storage Strategy

#### A. Current Implementation (In-Memory)
```typescript
private users: User[] = [];
```

#### B. Production Database Integration
```typescript
// TypeORM example
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// Repository injection
constructor(
  @InjectRepository(User)
  private userRepository: Repository<User>,
) {}
```

### 6. Performance Optimizations

#### A. Database Indexes (Production)
```sql
-- Unique indexes for constraints
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_users_username ON users(username);

-- Search indexes
CREATE INDEX idx_users_search ON users(email, username, first_name, last_name);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at);
```

#### B. Pagination Strategy
```typescript
// Efficient pagination với offset/limit
const skip = (page - 1) * limit;
const users = await userRepository.find({
  skip,
  take: limit,
  order: { [sortBy]: sortOrder }
});
```

#### C. Search Optimization
```typescript
// Full-text search (PostgreSQL example)
const users = await userRepository
  .createQueryBuilder('user')
  .where('to_tsvector(user.email || \' \' || user.username || \' \' || user.firstName || \' \' || user.lastName) @@ plainto_tsquery(:search)',
    { search })
  .getMany();
```

### 7. Testing Strategy

#### A. Unit Tests
- Service logic testing
- Business rule validation
- Error handling scenarios
- Password hashing/verification

#### B. Integration Tests
- Controller-Service integration
- DTO validation
- HTTP status codes
- Response format validation

#### C. E2E Tests
- Complete request-response cycle
- Real HTTP calls
- Database state verification
- Error scenarios

### 8. Monitoring & Logging

#### A. Request Logging
```typescript
// Add interceptor for request logging
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    console.log(`${request.method} ${request.url}`);
    return next.handle();
  }
}
```

#### B. Error Tracking
```typescript
// Global exception filter
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Log error details
    // Return formatted error response
  }
}
```

### 9. Scalability Considerations

#### A. Horizontal Scaling
- Stateless service design
- Database connection pooling
- Caching strategies (Redis)
- Load balancing

#### B. Vertical Scaling
- Database query optimization
- Memory usage optimization
- CPU-intensive operations (password hashing) optimization

### 10. Future Enhancements

#### A. Authentication & Authorization
- JWT token implementation
- Role-based access control
- OAuth integration

#### B. Advanced Features
- Email verification
- Password reset functionality
- User profile pictures
- Activity logging
- Audit trails
