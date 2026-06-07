import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { CacheService } from './cache/cache.service';
import { RateLimitGuard } from './rate-limit/rate-limit.guard';

@Module({
  providers: [
    CacheService,
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
  ],
  exports: [CacheService],
})
export class InfrastructureModule {}
