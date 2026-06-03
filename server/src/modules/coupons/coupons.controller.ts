import { Body, Controller, Post } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { ValidateCouponDto } from './dto/validate-coupon.dto';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post('validate')
  validateCoupon(@Body() input: ValidateCouponDto) {
    return this.couponsService.validateCoupon(input);
  }
}
