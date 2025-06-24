import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * User Entity
 *
 * TypeORM entity đại diện cho User table trong MySQL database
 * Sử dụng decorators để định nghĩa schema và constraints
 */

@Entity('users')
@Index(['email']) // Index cho email để tăng tốc độ query
@Index(['username']) // Index cho username để tăng tốc độ query
@Index(['firstName', 'lastName']) // Composite index cho search
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 255 })
  email!: string;

  @Column({ unique: true, length: 50 })
  username!: string;

  @Column({ length: 255 })
  password!: string; // Sẽ được hash

  @Column({ name: 'first_name', length: 50 })
  firstName!: string;

  @Column({ name: 'last_name', length: 50 })
  lastName!: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }

  /**
   * Trả về user object không có password (để response)
   */
  toResponseObject(): Omit<User, 'password'> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = this;
    return result as Omit<User, 'password'>;
  }

  /**
   * Cập nhật thông tin user
   */
  updateInfo(updateData: Partial<User>): void {
    Object.assign(this, updateData);
    this.updatedAt = new Date();
  }
}
