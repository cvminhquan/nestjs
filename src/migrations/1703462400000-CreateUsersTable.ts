import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsersTable1703462400000 implements MigrationInterface {
  name = 'CreateUsersTable1703462400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tạo bảng users
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: '(UUID())',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'username',
            type: 'varchar',
            length: '50',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'password',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'first_name',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'last_name',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Tạo indexes bằng SQL trực tiếp
    await queryRunner.query(`
      CREATE INDEX IDX_users_email ON users(email)
    `);

    await queryRunner.query(`
      CREATE INDEX IDX_users_username ON users(username)
    `);

    await queryRunner.query(`
      CREATE INDEX IDX_users_first_name_last_name ON users(first_name, last_name)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa indexes
    await queryRunner.query(
      `DROP INDEX IDX_users_first_name_last_name ON users`,
    );
    await queryRunner.query(`DROP INDEX IDX_users_username ON users`);
    await queryRunner.query(`DROP INDEX IDX_users_email ON users`);

    // Xóa bảng
    await queryRunner.dropTable('users');
  }
}
