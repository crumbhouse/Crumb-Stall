import { Global, Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { CacheService } from './cache/cache.service';
import { RequestLoggingInterceptor } from './logging/request-logging.interceptor';
import { RateLimitGuard } from './rate-limit/rate-limit.guard';
import { ObjectStorageService } from './storage/object-storage.service';
import { StorageController } from './storage/storage.controller';

@Global()
@Module({
  controllers: [StorageController],
  providers: [
    CacheService,
    ObjectStorageService,
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLoggingInterceptor,
    },
  ],
  exports: [CacheService, ObjectStorageService],
})
export class InfrastructureModule {}
