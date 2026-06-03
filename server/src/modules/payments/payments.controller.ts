import { Body, Controller, Post } from '@nestjs/common';
import { parseCreateRazorpayOrderDto } from './dto/create-razorpay-order.dto';
import { parseVerifyRazorpayPaymentDto } from './dto/verify-razorpay-payment.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('razorpay/orders')
  createRazorpayOrder(@Body() body: Record<string, unknown>) {
    return this.paymentsService.createRazorpayOrder(parseCreateRazorpayOrderDto(body));
  }

  @Post('razorpay/verify')
  verifyRazorpayPayment(@Body() body: Record<string, unknown>) {
    return this.paymentsService.verifyRazorpayPayment(parseVerifyRazorpayPaymentDto(body));
  }
}
