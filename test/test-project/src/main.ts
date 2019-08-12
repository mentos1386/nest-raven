import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as Sentry from '@sentry/node';
import { config } from 'dotenv';

async function bootstrap() {
  config();

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    debug: true,
  });

  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
