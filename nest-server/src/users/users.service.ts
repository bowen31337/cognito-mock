import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

export interface User {
  id: number;
  username: string;
  password: string;
  permissions: string[];
}

@Injectable()
export class UsersService {
  private readonly users: User[] = [];

  async create(
    username: string,
    password: string,
    permissions: string[],
  ): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: this.users.length + 1,
      username,
      password: hashedPassword,
      permissions,
    };
    this.users.push(user);
    return user;
  }

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username);
  }

  async findOneById(id: number): Promise<User | undefined> {
    return this.users.find((user) => user.id === id);
  }
}
