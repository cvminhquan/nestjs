import { OmitType, PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

/**
 * Update User DTO
 *
 * Kế thừa từ CreateUserDto nhưng tất cả fields đều optional
 * Loại bỏ password khỏi update (sẽ có endpoint riêng để đổi password)
 */

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const),
) {
  // Tất cả fields từ CreateUserDto sẽ trở thành optional
  // Trừ password đã được loại bỏ
}

/**
 * Change Password DTO
 *
 * DTO riêng để đổi password
 */
export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password of the user',
    example: 'currentPassword123',
    format: 'password',
  })
  @IsString({ message: 'Current password phải là chuỗi' })
  @IsNotEmpty({ message: 'Current password không được để trống' })
  currentPassword!: string;

  @ApiProperty({
    description: 'New password for the user',
    example: 'newPassword123',
    minLength: 6,
    format: 'password',
  })
  @IsString({ message: 'New password phải là chuỗi' })
  @IsNotEmpty({ message: 'New password không được để trống' })
  @MinLength(6, { message: 'New password phải có ít nhất 6 ký tự' })
  newPassword!: string;
}
