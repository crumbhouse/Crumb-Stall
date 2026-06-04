import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';

@Module({
  imports: [NotificationsModule],
  controllers: [OtpController],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
