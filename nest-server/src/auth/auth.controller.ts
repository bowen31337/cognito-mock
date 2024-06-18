import { Controller, Post, Body, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Request, Response } from 'express';
import { User } from '../users/users.service';

@Controller() // Ensure this decorator is present
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() body: { username: string; password: string; permissions: string[] },
  ) {
    const user = await this.authService.register(
      body.username,
      body.password,
      body.permissions,
    );
    return { message: 'User registered' };
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Req() req: Request, @Res() res: Response) {
    const user = req.user as User; // Cast req.user to User type
    const tokens = await this.authService.login(user);
    req.session.refreshToken = tokens.refreshToken;
    res.json(tokens);
  }

  @Post('refresh-token')
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    const { refreshToken } = req.session;
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }
    try {
      const newTokens = await this.authService.refreshToken(refreshToken);
      res.json(newTokens);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }
}
