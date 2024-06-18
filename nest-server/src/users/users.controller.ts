import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(
    @Body() body: { username: string; password: string; permissions: string[] },
  ) {
    const user = await this.usersService.create(
      body.username,
      body.password,
      body.permissions,
    );
    return user;
  }
}
