import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * Create User DTO
 *
 * DTO (Data Transfer Object) để validate dữ liệu đầu vào khi tạo user
 * Sử dụng class-validator để validation
 */

export class CreateUserDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Email phải có định dạng hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email!: string;

  @ApiProperty({
    description: 'Unique username for the user',
    example: 'johndoe',
    minLength: 3,
    maxLength: 20,
  })
  @IsString({ message: 'Username phải là chuỗi' })
  @IsNotEmpty({ message: 'Username không được để trống' })
  @MinLength(3, { message: 'Username phải có ít nhất 3 ký tự' })
  @MaxLength(20, { message: 'Username không được quá 20 ký tự' })
  username!: string;

  @ApiProperty({
    description: 'Password for the user account',
    example: 'password123',
    minLength: 6,
    format: 'password',
  })
  @IsString({ message: 'Password phải là chuỗi' })
  @IsNotEmpty({ message: 'Password không được để trống' })
  @MinLength(6, { message: 'Password phải có ít nhất 6 ký tự' })
  password!: string;

  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
    maxLength: 50,
  })
  @IsString({ message: 'First name phải là chuỗi' })
  @IsNotEmpty({ message: 'First name không được để trống' })
  @MaxLength(50, { message: 'First name không được quá 50 ký tự' })
  firstName!: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
    maxLength: 50,
  })
  @IsString({ message: 'Last name phải là chuỗi' })
  @IsNotEmpty({ message: 'Last name không được để trống' })
  @MaxLength(50, { message: 'Last name không được quá 50 ký tự' })
  lastName!: string;

  @ApiProperty({
    description: 'Whether the user account is active',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive phải là boolean' })
  isActive?: boolean = true;
}
