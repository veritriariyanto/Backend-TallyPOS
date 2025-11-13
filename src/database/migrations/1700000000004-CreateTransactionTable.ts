import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateTransactionTable1700000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'transactions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'transaction_code',
            type: 'varchar',
            length: '50',
            isUnique: true,
            comment: 'Format: TRX-YYYYMMDD-XXXXX',
          },
          {
            name: 'user_id',
            type: 'uuid',
            comment: 'Kasir yang melakukan transaksi',
          },
          {
            name: 'customer_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'transaction_date',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'subtotal',
            type: 'decimal',
            precision: 15,
            scale: 2,
          },
          {
            name: 'discount_amount',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'discount_percentage',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
          },
          {
            name: 'tax_amount',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'total_amount',
            type: 'decimal',
            precision: 15,
            scale: 2,
          },
          {
            name: 'payment_method',
            type: 'enum',
            enum: ['cash', 'debit', 'credit', 'qris', 'transfer'],
            default: "'cash'",
          },
          {
            name: 'payment_amount',
            type: 'decimal',
            precision: 15,
            scale: 2,
          },
          {
            name: 'change_amount',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['completed', 'cancelled', 'refunded'],
            default: "'completed'",
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Foreign keys
    await queryRunner.createForeignKey(
      'transactions',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'RESTRICT',
        name: 'FK_TRANSACTION_USER',
      }),
    );

    await queryRunner.createForeignKey(
      'transactions',
      new TableForeignKey({
        columnNames: ['customer_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'customers',
        onDelete: 'SET NULL',
        name: 'FK_TRANSACTION_CUSTOMER',
      }),
    );

    // Indexes
    await queryRunner.createIndex(
      'transactions',
      new TableIndex({
        name: 'IDX_TRANSACTION_CODE',
        columnNames: ['transaction_code'],
      }),
    );

    await queryRunner.createIndex(
      'transactions',
      new TableIndex({
        name: 'IDX_TRANSACTION_DATE',
        columnNames: ['transaction_date'],
      }),
    );

    await queryRunner.createIndex(
      'transactions',
      new TableIndex({
        name: 'IDX_TRANSACTION_USER',
        columnNames: ['user_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('transactions', 'IDX_TRANSACTION_USER');
    await queryRunner.dropIndex('transactions', 'IDX_TRANSACTION_DATE');
    await queryRunner.dropIndex('transactions', 'IDX_TRANSACTION_CODE');
    await queryRunner.dropForeignKey('transactions', 'FK_TRANSACTION_CUSTOMER');
    await queryRunner.dropForeignKey('transactions', 'FK_TRANSACTION_USER');
    await queryRunner.dropTable('transactions');
  }
}
