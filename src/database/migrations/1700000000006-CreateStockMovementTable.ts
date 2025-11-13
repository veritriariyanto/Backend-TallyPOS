import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateStockMovementTable1700000000006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'stock_movements',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'product_id',
            type: 'uuid',
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['in', 'out', 'adjustment'],
            comment: 'in: pembelian/restock, out: penjualan, adjustment: koreksi',
          },
          {
            name: 'quantity',
            type: 'integer',
            comment: 'Positif untuk in, negatif untuk out',
          },
          {
            name: 'stock_before',
            type: 'integer',
          },
          {
            name: 'stock_after',
            type: 'integer',
          },
          {
            name: 'reference_id',
            type: 'uuid',
            isNullable: true,
            comment: 'ID transaksi atau referensi lainnya',
          },
          {
            name: 'reference_type',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'transaction, purchase, adjustment, etc',
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
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
      'stock_movements',
      new TableForeignKey({
        columnNames: ['product_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'products',
        onDelete: 'CASCADE',
        name: 'FK_STOCK_PRODUCT',
      }),
    );

    await queryRunner.createForeignKey(
      'stock_movements',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'RESTRICT',
        name: 'FK_STOCK_USER',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('stock_movements', 'FK_STOCK_USER');
    await queryRunner.dropForeignKey('stock_movements', 'FK_STOCK_PRODUCT');
    await queryRunner.dropTable('stock_movements');
  }
}
