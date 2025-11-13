import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { TransactionDetail } from './entities/transaction-detail.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionStatus } from './enums/transaction.enum';
import { ProductsService } from '../products/products.service';
import { CustomersService } from '../customers/customers.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(TransactionDetail)
    private readonly transactionDetailRepository: Repository<TransactionDetail>,
    private readonly productsService: ProductsService,
    private readonly customersService: CustomersService,
  ) {}

  async create(createTransactionDto: CreateTransactionDto, userId: string): Promise<Transaction> {
    // Verify customer if provided
    if (createTransactionDto.customerId) {
      await this.customersService.findOne(createTransactionDto.customerId);
    }

    // Verify products and calculate totals
    let subtotal = 0;
    const transactionDetails: Partial<TransactionDetail>[] = [];

    for (const item of createTransactionDto.items) {
      const product = await this.productsService.findOne(item.productId);

      // Check stock availability
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${product.name}. Available: ${product.stock}`,
        );
      }

      const itemSubtotal =
        item.quantity * Number(product.sellingPrice) - (item.discountAmount || 0);

      transactionDetails.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: Number(product.sellingPrice),
        discountAmount: item.discountAmount || 0,
        subtotal: itemSubtotal,
      });

      subtotal += itemSubtotal;
    }

    // Calculate total with discount and tax
    const discountAmount = createTransactionDto.discountAmount || 0;
    const discountPercentage = createTransactionDto.discountPercentage || 0;
    const discountFromPercentage = (subtotal * discountPercentage) / 100;
    const totalDiscount = discountAmount + discountFromPercentage;
    const taxAmount = createTransactionDto.taxAmount || 0;
    const totalAmount = subtotal - totalDiscount + taxAmount;

    // Validate payment amount
    if (createTransactionDto.paymentAmount < totalAmount) {
      throw new BadRequestException('Payment amount is less than total amount');
    }

    const changeAmount = createTransactionDto.paymentAmount - totalAmount;

    // Generate transaction code
    const transactionCode = await this.generateTransactionCode();

    // Create transaction
    const transaction = this.transactionRepository.create({
      transactionCode,
      userId,
      customerId: createTransactionDto.customerId,
      subtotal,
      discountAmount: totalDiscount,
      discountPercentage,
      taxAmount,
      totalAmount,
      paymentMethod: createTransactionDto.paymentMethod,
      paymentAmount: createTransactionDto.paymentAmount,
      changeAmount,
      notes: createTransactionDto.notes,
      status: TransactionStatus.COMPLETED,
    });

    const savedTransaction = await this.transactionRepository.save(transaction);

    // Create transaction details and update stock
    for (const detail of transactionDetails) {
      const transactionDetail = this.transactionDetailRepository.create({
        ...detail,
        transactionId: savedTransaction.id,
      });
      await this.transactionDetailRepository.save(transactionDetail);

      // Update product stock
      if (detail.productId && detail.quantity) {
        await this.productsService.updateStock(detail.productId, -detail.quantity);
      }
    }

    // Update customer stats if customer is provided
    if (createTransactionDto.customerId) {
      await this.customersService.updateTransactionStats(
        createTransactionDto.customerId,
        Number(totalAmount),
      );
    }

    // Return transaction with details
    return await this.findOne(savedTransaction.id);
  }

  async findAll(
    startDate?: Date,
    endDate?: Date,
    userId?: string,
    status?: TransactionStatus,
  ): Promise<Transaction[]> {
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.user', 'user')
      .leftJoinAndSelect('transaction.customer', 'customer')
      .leftJoinAndSelect('transaction.details', 'details')
      .orderBy('transaction.transactionDate', 'DESC');

    if (startDate && endDate) {
      queryBuilder.andWhere('transaction.transactionDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    if (userId) {
      queryBuilder.andWhere('transaction.userId = :userId', { userId });
    }

    if (status) {
      queryBuilder.andWhere('transaction.status = :status', { status });
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['user', 'customer', 'details', 'details.product'],
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }

  async findByCode(transactionCode: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { transactionCode },
      relations: ['user', 'customer', 'details', 'details.product'],
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with code ${transactionCode} not found`);
    }

    return transaction;
  }

  async getSalesReport(startDate: Date, endDate: Date): Promise<any> {
    const transactions = await this.transactionRepository.find({
      where: {
        transactionDate: Between(startDate, endDate),
        status: TransactionStatus.COMPLETED,
      },
      relations: ['details'],
    });

    const totalSales = transactions.reduce(
      (sum, t) => sum + Number(t.totalAmount),
      0,
    );
    const totalTransactions = transactions.length;
    const totalItems = transactions.reduce(
      (sum, t) => sum + t.details.reduce((s, d) => s + d.quantity, 0),
      0,
    );

    return {
      startDate,
      endDate,
      totalSales,
      totalTransactions,
      totalItems,
      averageTransaction: totalTransactions > 0 ? totalSales / totalTransactions : 0,
      transactions,
    };
  }

  async cancelTransaction(id: string): Promise<Transaction> {
    const transaction = await this.findOne(id);

    if (transaction.status !== TransactionStatus.COMPLETED) {
      throw new BadRequestException('Only completed transactions can be cancelled');
    }

    // Restore product stock
    for (const detail of transaction.details) {
      await this.productsService.updateStock(detail.productId, detail.quantity);
    }

    // Update customer stats if customer exists
    if (transaction.customerId) {
      await this.customersService.updateTransactionStats(
        transaction.customerId,
        -Number(transaction.totalAmount),
      );
    }

    transaction.status = TransactionStatus.CANCELLED;
    return await this.transactionRepository.save(transaction);
  }

  private async generateTransactionCode(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    const lastTransaction = await this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.transactionCode LIKE :prefix', { prefix: `TRX-${dateStr}-%` })
      .orderBy('transaction.transactionCode', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastTransaction) {
      const lastSequence = parseInt(lastTransaction.transactionCode.split('-')[2]);
      sequence = lastSequence + 1;
    }

    return `TRX-${dateStr}-${sequence.toString().padStart(5, '0')}`;
  }
}
