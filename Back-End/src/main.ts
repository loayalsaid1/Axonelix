import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { DatabaseExceptionFilter } from './common/filters/database-exception.filter';
import { LoggerInterceptor } from './common/interceptors/logger.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS — allow the Next.js frontend (dev: 3001, prod: adjust via env)
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Enable CORS for the frontend dev server
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global exception filters (order matters - specific to general)
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(
    new DatabaseExceptionFilter(),
    new GlobalExceptionFilter(httpAdapter),
  );

  // Global interceptor
  app.useGlobalInterceptors(new LoggerInterceptor());

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
