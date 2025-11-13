import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const customer = this.customerRepository.create(createCustomerDto);
    return await this.customerRepository.save(customer);
  }

  async findAll(search?: string): Promise<Customer[]> {
    const queryBuilder = this.customerRepository
      .createQueryBuilder('customer')
      .orderBy('customer.createdAt', 'DESC');

    if (search) {
      queryBuilder.where(
        '(customer.name ILIKE :search OR customer.phone ILIKE :search OR customer.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    return await queryBuilder.getMany();
  }

  async findTopCustomers(limit: number = 10): Promise<Customer[]> {
    return await this.customerRepository.find({
      order: { totalSpent: 'DESC' },
      take: limit,
    });
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async findByPhone(phone: string): Promise<Customer | null> {
    return await this.customerRepository.findOne({
      where: { phone },
    });
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);
    Object.assign(customer, updateCustomerDto);
    return await this.customerRepository.save(customer);
  }

  async updateTransactionStats(
    id: string,
    transactionAmount: number,
  ): Promise<Customer> {
    const customer = await this.findOne(id);
    customer.totalTransactions += 1;
    customer.totalSpent = Number(customer.totalSpent) + transactionAmount;
    return await this.customerRepository.save(customer);
  }

  async remove(id: string): Promise<void> {
    const customer = await this.findOne(id);
    await this.customerRepository.remove(customer);
  }
}
