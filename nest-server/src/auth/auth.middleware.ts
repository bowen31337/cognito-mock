import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).send('Access denied. No token provided.');
    }

    try {
      const decoded = this.jwtService.verify(token);
      req.user = decoded;
      next();
    } catch (ex) {
      return res.status(400).send('Invalid token');
    }
  }
}
