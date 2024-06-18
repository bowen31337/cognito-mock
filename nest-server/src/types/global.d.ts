// src/types/global.d.ts

// Extend Express Request interface to include a user property
declare namespace Express {
  export interface Request {
    user?: {
      userId: number;
      username: string;
      permissions: string[];
    };
  }
}

// Global type for User
declare global {
  interface User {
    id: number;
    username: string;
    password: string;
    permissions: string[];
  }
}

import 'express-session';

declare module 'express-session' {
  interface SessionData {
    refreshToken: string;
  }
}
