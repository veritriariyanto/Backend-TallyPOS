import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateProductTable1700000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'products',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'category_id',
            type: 'uuid',
          },
          {
            name: 'sku',
            type: 'varchar',
            length: '50',
            isUnique: true,
          },
          {
            name: 'barcode',
            type: 'varchar',
            length: '100',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '200',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'purchase_price',
            type: 'decimal',
            precision: 12,
            scale: 2,
            default: 0,
          },
          {
            name: 'selling_price',
            type: 'decimal',
            precision: 12,
            scale: 2,
          },
          {
            name: 'stock',
            type: 'integer',
            default: 0,
          },
          {
            name: 'min_stock',
            type: 'integer',
            default: 5,
            comment: 'Minimum stock untuk alert',
          },
          {
            name: 'unit',
            type: 'varchar',
            length: '20',
            default: "'pcs'",
            comment: 'pcs, kg, liter, box, etc',
          },
          {
            name: 'image_url',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
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

    // Foreign key ke categories
    await queryRunner.createForeignKey(
      'products',
      new TableForeignKey({
        columnNames: ['category_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'categories',
        onDelete: 'RESTRICT',
        name: 'FK_PRODUCT_CATEGORY',
      }),
    );

    // Indexes untuk performa
    await queryRunner.createIndex(
      'products',
      new TableIndex({
        name: 'IDX_PRODUCT_SKU',
        columnNames: ['sku'],
      }),
    );

    await queryRunner.createIndex(
      'products',
      new TableIndex({
        name: 'IDX_PRODUCT_BARCODE',
        columnNames: ['barcode'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('products', 'IDX_PRODUCT_BARCODE');
    await queryRunner.dropIndex('products', 'IDX_PRODUCT_SKU');
    await queryRunner.dropForeignKey('products', 'FK_PRODUCT_CATEGORY');
    await queryRunner.dropTable('products');
  }
}
