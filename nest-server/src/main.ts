/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="./types/global.d.ts" />


import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: 'http://localhost:3000', // Replace with your frontend URL
    credentials: true,
  });

  app.use(
    session({
      secret: 'your-session-secret',
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false },
    }),
  );

  await app.listen(3000);
}
bootstrap();
