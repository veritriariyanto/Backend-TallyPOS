import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionDetail } from '../transactions/entities/transaction-detail.entity';

@Injectable()
export class TransactionDetailsService {
  constructor(
    @InjectRepository(TransactionDetail)
    private readonly transactionDetailRepository: Repository<TransactionDetail>,
  ) {}

  async findByTransactionId(transactionId: string): Promise<TransactionDetail[]> {
    return await this.transactionDetailRepository.find({
      where: { transactionId },
      relations: ['product'],
      order: { createdAt: 'ASC' },
    });
  }

  async findByProductId(productId: string): Promise<TransactionDetail[]> {
    return await this.transactionDetailRepository.find({
      where: { productId },
      relations: ['transaction', 'product'],
      order: { createdAt: 'DESC' },
      take: 50, // Limit to last 50 transactions
    });
  }

  async findOne(id: string): Promise<TransactionDetail> {
    const detail = await this.transactionDetailRepository.findOne({
      where: { id },
      relations: ['transaction', 'product'],
    });

    if (!detail) {
      throw new NotFoundException(`Transaction detail with ID ${id} not found`);
    }

    return detail;
  }

  async getProductSalesStats(
    productId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any> {
    const queryBuilder = this.transactionDetailRepository
      .createQueryBuilder('detail')
      .leftJoin('detail.transaction', 'transaction')
      .where('detail.productId = :productId', { productId })
      .andWhere('transaction.status = :status', { status: 'completed' });

    if (startDate && endDate) {
      queryBuilder.andWhere('transaction.transactionDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const details = await queryBuilder.getMany();

    const totalQuantity = details.reduce((sum, d) => sum + d.quantity, 0);
    const totalRevenue = details.reduce((sum, d) => sum + Number(d.subtotal), 0);

    return {
      productId,
      totalQuantity,
      totalRevenue,
      totalTransactions: details.length,
      averageQuantityPerTransaction: details.length > 0 ? totalQuantity / details.length : 0,
      details,
    };
  }

  async getTopSellingProducts(limit: number = 10): Promise<any[]> {
    try {
      const result = await this.transactionDetailRepository
        .createQueryBuilder('detail')
        .select('detail.productId', 'productId')
        .addSelect('detail.productName', 'productName')
        .addSelect('SUM(detail.quantity)', 'totalquantity')
        .addSelect('SUM(detail.subtotal)', 'totalrevenue')
        .addSelect('COUNT(detail.id)', 'transactioncount')
        .leftJoin('detail.transaction', 'transaction')
        .where('transaction.status = :status', { status: 'completed' })
        .groupBy('detail.productId')
        .addGroupBy('detail.productName')
        .orderBy('totalquantity', 'DESC')
        .limit(limit)
        .getRawMany();

      return result.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        totalQuantity: parseInt(item.totalquantity),
        totalRevenue: parseFloat(item.totalrevenue),
        transactionCount: parseInt(item.transactioncount),
      }));
    } catch (error) {
      // Log error ke console agar mudah debug
      console.error('TopSellingProducts error:', error);
      throw new HttpException(
        'Failed to get top selling products: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
