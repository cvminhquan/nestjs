import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

/**
 * Query User DTO
 *
 * DTO để handle query parameters cho việc tìm kiếm và phân trang users
 */

export class QueryUserDto {
  @ApiProperty({
    description: 'Page number for pagination',
    example: '1',
    default: '1',
    required: false,
  })
  @IsOptional()
  @IsNumberString({}, { message: 'Page phải là số' })
  page?: string = '1';

  @ApiProperty({
    description: 'Number of items per page',
    example: '10',
    default: '10',
    required: false,
  })
  @IsOptional()
  @IsNumberString({}, { message: 'Limit phải là số' })
  limit?: string = '10';

  @ApiProperty({
    description: 'Search term for filtering users',
    example: 'john',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Search phải là chuỗi' })
  search?: string;

  @ApiProperty({
    description: 'Filter by active status',
    example: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean({ message: 'isActive phải là boolean' })
  isActive?: boolean;

  @ApiProperty({
    description: 'Field to sort by',
    example: 'createdAt',
    default: 'createdAt',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Sort field phải là chuỗi' })
  sortBy?: string = 'createdAt';

  @ApiProperty({
    description: 'Sort order',
    example: 'desc',
    enum: ['asc', 'desc'],
    default: 'desc',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Sort order phải là asc hoặc desc' })
  sortOrder?: 'asc' | 'desc' = 'desc';
}

/**
 * Response DTO cho danh sách users với pagination
 */
export class PaginatedUsersResponseDto {
  data!: any[]; // Sẽ là User[] trong thực tế
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
  hasNext!: boolean;
  hasPrev!: boolean;
}
