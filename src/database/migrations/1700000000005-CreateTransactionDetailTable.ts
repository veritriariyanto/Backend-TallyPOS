import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateTransactionDetailTable1700000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'transaction_details',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'transaction_id',
            type: 'uuid',
          },
          {
            name: 'product_id',
            type: 'uuid',
          },
          {
            name: 'product_name',
            type: 'varchar',
            length: '200',
            comment: 'Snapshot nama produk saat transaksi',
          },
          {
            name: 'quantity',
            type: 'integer',
          },
          {
            name: 'unit_price',
            type: 'decimal',
            precision: 12,
            scale: 2,
            comment: 'Harga satuan saat transaksi',
          },
          {
            name: 'discount_amount',
            type: 'decimal',
            precision: 12,
            scale: 2,
            default: 0,
          },
          {
            name: 'subtotal',
            type: 'decimal',
            precision: 15,
            scale: 2,
            comment: 'quantity * unit_price - discount',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Foreign keys
    await queryRunner.createForeignKey(
      'transaction_details',
      new TableForeignKey({
        columnNames: ['transaction_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'transactions',
        onDelete: 'CASCADE',
        name: 'FK_DETAIL_TRANSACTION',
      }),
    );

    await queryRunner.createForeignKey(
      'transaction_details',
      new TableForeignKey({
        columnNames: ['product_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'products',
        onDelete: 'RESTRICT',
        name: 'FK_DETAIL_PRODUCT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('transaction_details', 'FK_DETAIL_PRODUCT');
    await queryRunner.dropForeignKey('transaction_details', 'FK_DETAIL_TRANSACTION');
    await queryRunner.dropTable('transaction_details');
  }
}
