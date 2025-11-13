import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionDetailsService } from './transaction-details.service';
import { TransactionDetailsController } from './transaction-details.controller';
import { TransactionDetail } from '../transactions/entities/transaction-detail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionDetail])],
  controllers: [TransactionDetailsController],
  providers: [TransactionDetailsService],
  exports: [TransactionDetailsService],
})
export class TransactionDetailsModule {}
