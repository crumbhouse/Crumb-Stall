import { Body, Controller, Post } from '@nestjs/common';
import { CreateRazorpayOrderDto } from './dto/create-razorpay-order.dto';
import { VerifyRazorpayPaymentDto } from './dto/verify-razorpay-payment.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('razorpay/orders')
  createRazorpayOrder(@Body() body: CreateRazorpayOrderDto) {
    return this.paymentsService.createRazorpayOrder(body);
  }

  @Post('razorpay/verify')
  verifyRazorpayPayment(@Body() body: VerifyRazorpayPaymentDto) {
    return this.paymentsService.verifyRazorpayPayment(body);
  }
}
