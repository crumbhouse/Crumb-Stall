import './config/load-env';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { API_PREFIX } from './common/constants/app.constants';
import { setupSwagger } from './config/swagger';
import { setupValidation } from './config/validation';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix(API_PREFIX);
  const allowedOrigins = (process.env.CLIENT_ORIGIN ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1):30\d{2}$/.test(origin)
      ) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  });
  setupValidation(app);
  setupSwagger(app);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
