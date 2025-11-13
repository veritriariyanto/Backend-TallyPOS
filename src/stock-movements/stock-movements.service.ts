import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { StockMovement, MovementType } from './entities/stock-movement.entity';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class StockMovementsService {
  constructor(
    @InjectRepository(StockMovement)
    private readonly stockMovementRepository: Repository<StockMovement>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(
    createStockMovementDto: CreateStockMovementDto,
    userId: string,
  ): Promise<StockMovement> {
    const { productId, type, quantity, referenceType, referenceId, notes } =
      createStockMovementDto;

    // Validate product exists
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Validate quantity based on type
    if (type === MovementType.OUT && quantity > 0) {
      throw new BadRequestException('OUT movement must have negative quantity');
    }

    if (
      (type === MovementType.IN || type === MovementType.RETURN) &&
      quantity < 0
    ) {
      throw new BadRequestException(
        'IN/RETURN movement must have positive quantity',
      );
    }

    const stockBefore = product.stock;
    const stockAfter = stockBefore + quantity;

    if (stockAfter < 0) {
      throw new BadRequestException(
        `Insufficient stock. Current: ${stockBefore}, Requested: ${Math.abs(quantity)}`,
      );
    }

    // Create stock movement record
    const stockMovement = this.stockMovementRepository.create({
      productId,
      userId,
      type,
      quantity,
      stockBefore,
      stockAfter,
      referenceType,
      referenceId,
      notes,
    });

    await this.stockMovementRepository.save(stockMovement);

    // Update product stock
    await this.productRepository.update(productId, { stock: stockAfter });

    const savedMovement = await this.stockMovementRepository.findOne({
      where: { id: stockMovement.id },
      relations: ['product', 'user'],
    });

    if (!savedMovement) {
      throw new NotFoundException(`Stock movement with ID ${stockMovement.id} not found`);
    }

    return savedMovement;
  }

  async findAll(
    productId?: string,
    type?: MovementType,
    startDate?: Date,
    endDate?: Date,
  ): Promise<StockMovement[]> {
    const queryBuilder = this.stockMovementRepository
      .createQueryBuilder('movement')
      .leftJoinAndSelect('movement.product', 'product')
      .leftJoinAndSelect('movement.user', 'user')
      .orderBy('movement.createdAt', 'DESC');

    if (productId) {
      queryBuilder.andWhere('movement.productId = :productId', { productId });
    }

    if (type) {
      queryBuilder.andWhere('movement.type = :type', { type });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('movement.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    return await queryBuilder.getMany();
  }

  async findByProduct(productId: string): Promise<StockMovement[]> {
    return await this.stockMovementRepository.find({
      where: { productId },
      relations: ['product', 'user'],
      order: { createdAt: 'DESC' },
      take: 100, // Last 100 movements
    });
  }

  async findByReference(
    referenceType: string,
    referenceId: string,
  ): Promise<StockMovement[]> {
    return await this.stockMovementRepository.find({
      where: { referenceType, referenceId },
      relations: ['product', 'user'],
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<StockMovement> {
    const movement = await this.stockMovementRepository.findOne({
      where: { id },
      relations: ['product', 'user'],
    });

    if (!movement) {
      throw new NotFoundException(`Stock movement with ID ${id} not found`);
    }

    return movement;
  }

  async getStockSummary(
    productId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any> {
    const queryBuilder = this.stockMovementRepository
      .createQueryBuilder('movement')
      .where('movement.productId = :productId', { productId });

    if (startDate && endDate) {
      queryBuilder.andWhere('movement.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const movements = await queryBuilder.getMany();

    const summary = {
      productId,
      totalIn: 0,
      totalOut: 0,
      totalAdjustment: 0,
      totalReturn: 0,
      totalDamaged: 0,
      movementCount: movements.length,
      movements: [] as any[],
    };

    movements.forEach((movement) => {
      switch (movement.type) {
        case MovementType.IN:
          summary.totalIn += movement.quantity;
          break;
        case MovementType.OUT:
          summary.totalOut += Math.abs(movement.quantity);
          break;
        case MovementType.ADJUSTMENT:
          summary.totalAdjustment += movement.quantity;
          break;
        case MovementType.RETURN:
          summary.totalReturn += movement.quantity;
          break;
        case MovementType.DAMAGED:
          summary.totalDamaged += Math.abs(movement.quantity);
          break;
      }
    });

    summary.movements = movements;

    return summary;
  }

  async getMovementsByType(type: MovementType): Promise<StockMovement[]> {
    return await this.stockMovementRepository.find({
      where: { type },
      relations: ['product', 'user'],
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  // Helper method untuk create movement dari sistem lain (transactions, dll)
  async createSystemMovement(
    productId: string,
    userId: string,
    type: MovementType,
    quantity: number,
    referenceType: string,
    referenceId: string,
    notes?: string,
  ): Promise<StockMovement> {
    return await this.create(
      {
        productId,
        type,
        quantity,
        referenceType,
        referenceId,
        notes,
      },
      userId,
    );
  }
}
