import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';

export interface JwtPayload {
  sub: string;
  username: string;
  role: string;
  avatarUrl?: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    fullName: string;
    avatarUrl?: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.usersService.findByUsername(loginDto.username);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is not active');
    }

    const isPasswordValid = await this.usersService.validatePassword(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      avatarUrl: user.avatarUrl,
    };

    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async validateUser(userId: string): Promise<User | null> {
    try {
      return await this.usersService.findOne(userId);
    } catch {
      return null;
    }
  }
}
