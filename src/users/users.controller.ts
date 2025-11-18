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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './enums/user-role.enum';
import {
  userAvatarStorage,
  imageFileFilter,
  maxFileSize,
} from '../common/utils/file-upload.util';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // Upload endpoints harus SEBELUM :id routes untuk menghindari conflict
  @Post('upload-avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: userAvatarStorage,
      fileFilter: imageFileFilter,
      limits: { fileSize: maxFileSize },
    }),
  )
  uploadAvatar(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const avatarUrl = `/uploads/users/${file.filename}`;
    return {
      message: 'Avatar uploaded successfully',
      filename: file.filename,
      url: avatarUrl,
      path: file.path,
    };
  }

  @Post('me/upload-avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: userAvatarStorage,
      fileFilter: imageFileFilter,
      limits: { fileSize: maxFileSize },
    }),
  )
  async uploadMyAvatar(@Request() req, @UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const userId = req.user.userId;
    const avatarUrl = `/uploads/users/${file.filename}`;

    // Update current user's avatar
    const user = await this.usersService.update(userId, {
      avatarUrl,
    } as any);

    return {
      message: 'Avatar uploaded successfully',
      filename: file.filename,
      url: avatarUrl,
      user,
    };
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Post(':id/upload-avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: userAvatarStorage,
      fileFilter: imageFileFilter,
      limits: { fileSize: maxFileSize },
    }),
  )
  async uploadAndUpdateAvatar(
    @Param('id') id: string,
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const avatarUrl = `/uploads/users/${file.filename}`;

    // Update user with new avatar URL
    const user = await this.usersService.update(id, {
      avatarUrl,
    } as any);

    return {
      message: 'Avatar uploaded and user updated successfully',
      filename: file.filename,
      url: avatarUrl,
      user,
    };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
