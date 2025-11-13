import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { StockMovementsService } from './stock-movements.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { MovementType } from './entities/stock-movement.entity';

@Controller('stock-movements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StockMovementsController {
  constructor(
    private readonly stockMovementsService: StockMovementsService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createStockMovementDto: CreateStockMovementDto, @Request() req) {
    return this.stockMovementsService.create(
      createStockMovementDto,
      req.user.userId,
    );
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll(
    @Query('productId') productId?: string,
    @Query('type') type?: MovementType,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.stockMovementsService.findAll(productId, type, start, end);
  }

  @Get('product/:productId')
  findByProduct(@Param('productId') productId: string) {
    return this.stockMovementsService.findByProduct(productId);
  }

  @Get('product/:productId/summary')
  @Roles(UserRole.ADMIN)
  getStockSummary(
    @Param('productId') productId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.stockMovementsService.getStockSummary(productId, start, end);
  }

  @Get('reference/:referenceType/:referenceId')
  @Roles(UserRole.ADMIN)
  findByReference(
    @Param('referenceType') referenceType: string,
    @Param('referenceId') referenceId: string,
  ) {
    return this.stockMovementsService.findByReference(referenceType, referenceId);
  }

  @Get('type/:type')
  @Roles(UserRole.ADMIN)
  getMovementsByType(@Param('type') type: MovementType) {
    return this.stockMovementsService.getMovementsByType(type);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockMovementsService.findOne(id);
  }
}
