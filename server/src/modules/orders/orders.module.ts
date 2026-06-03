import { Module } from '@nestjs/common';
import { OtpModule } from '../otp/otp.module';
import { PaymentsModule } from '../payments/payments.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [PaymentsModule, OtpModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
