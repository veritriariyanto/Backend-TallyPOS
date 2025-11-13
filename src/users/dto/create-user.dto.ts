import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';
import { UserRole } from '../enums/user-role.enum';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
