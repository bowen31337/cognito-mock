import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService, User } from '../users/users.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    username: string,
    password: string,
    permissions: string[],
  ): Promise<User> {
    return this.usersService.create(username, password, permissions);
  }

  async validateUser(username: string, pass: string): Promise<User | null> {
    const user = await this.usersService.findOne(username);
    if (user && (await bcrypt.compare(pass, user.password))) {
      return user; // Return the complete user object
    }
    return null;
  }

  async login(user: User) {
    const payload = {
      username: user.username,
      sub: user.id,
      permissions: user.permissions,
    };
    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '15m' }),
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: '7d',
        secret: 'refresh-secret',
      }),
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: 'refresh-secret',
      });
      const user = await this.usersService.findOneById(payload.sub);
      if (!user) {
        throw new Error('User not found');
      }
      return {
        accessToken: this.jwtService.sign(
          {
            username: user.username,
            sub: user.id,
            permissions: user.permissions,
          },
          { expiresIn: '15m' },
        ),
      };
    } catch (e) {
      throw new Error('Invalid refresh token');
    }
  }
}
