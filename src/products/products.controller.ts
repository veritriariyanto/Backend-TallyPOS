import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import {
  productImageStorage,
  imageFileFilter,
  maxFileSize,
} from '../common/utils/file-upload.util';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  // Upload endpoints harus SEBELUM :id routes untuk menghindari conflict
  @Post('upload-image')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: productImageStorage,
      fileFilter: imageFileFilter,
      limits: { fileSize: maxFileSize },
    }),
  )
  uploadImage(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const imageUrl = `/uploads/products/${file.filename}`;
    return {
      message: 'Image uploaded successfully',
      filename: file.filename,
      url: imageUrl,
      path: file.path,
    };
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.productsService.findAll(search, categoryId);
  }

  @Get('active')
  findAllActive() {
    return this.productsService.findAllActive();
  }

  @Get('low-stock')
  @Roles(UserRole.ADMIN)
  findLowStock() {
    return this.productsService.findLowStock();
  }

  @Get('sku/:sku')
  findBySku(@Param('sku') sku: string) {
    return this.productsService.findBySku(sku);
  }

  @Get('barcode/:barcode')
  findByBarcode(@Param('barcode') barcode: string) {
    return this.productsService.findByBarcode(barcode);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Patch(':id/stock')
  @Roles(UserRole.ADMIN)
  updateStock(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
  ) {
    return this.productsService.updateStock(id, quantity);
  }

  @Patch(':id/toggle-active')
  @Roles(UserRole.ADMIN)
  toggleActive(@Param('id') id: string) {
    return this.productsService.toggleActive(id);
  }

  @Post(':id/upload-image')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: productImageStorage,
      fileFilter: imageFileFilter,
      limits: { fileSize: maxFileSize },
    }),
  )
  async uploadAndUpdateImage(
    @Param('id') id: string,
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const imageUrl = `/uploads/products/${file.filename}`;

    // Update product with new image URL
    const product = await this.productsService.update(id, {
      imageUrl,
    });

    return {
      message: 'Image uploaded and product updated successfully',
      filename: file.filename,
      url: imageUrl,
      product,
    };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
