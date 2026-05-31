import './config/load-env';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { API_PREFIX } from './common/constants/app.constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix(API_PREFIX);
  app.enableCors({
    origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
