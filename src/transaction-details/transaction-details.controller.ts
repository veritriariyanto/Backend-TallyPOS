import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TransactionDetailsService } from './transaction-details.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';

@Controller('transaction-details')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransactionDetailsController {
  constructor(
    private readonly transactionDetailsService: TransactionDetailsService,
  ) {}

  @Get('transaction/:transactionId')
  findByTransactionId(@Param('transactionId') transactionId: string) {
    return this.transactionDetailsService.findByTransactionId(transactionId);
  }

  @Get('product/:productId')
  @Roles(UserRole.ADMIN)
  findByProductId(@Param('productId') productId: string) {
    return this.transactionDetailsService.findByProductId(productId);
  }

  @Get('product/:productId/stats')
  @Roles(UserRole.ADMIN)
  getProductSalesStats(
    @Param('productId') productId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.transactionDetailsService.getProductSalesStats(
      productId,
      start,
      end,
    );
  }

  @Get('top-selling')
  @Roles(UserRole.ADMIN)
  getTopSellingProducts(@Query('limit') limit?: number) {
    return this.transactionDetailsService.getTopSellingProducts(limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionDetailsService.findOne(id);
  }
}
