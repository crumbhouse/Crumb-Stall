import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthenticatedUserGuard } from '../../common/auth/authenticated-user.guard';
import { Roles } from '../../common/auth/roles.decorator';
import { RolesGuard } from '../../common/auth/roles.guard';
import { CouponsService } from './coupons.service';
import { CreateCouponDto, UpdateCouponDto } from './dto/coupon-input.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get('admin')
  @UseGuards(AuthenticatedUserGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAllForAdmin() {
    return this.couponsService.findAllForAdmin();
  }

  @Post('validate')
  validateCoupon(@Body() input: ValidateCouponDto) {
    return this.couponsService.validateCoupon(input);
  }

  @Post()
  @UseGuards(AuthenticatedUserGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() input: CreateCouponDto) {
    return this.couponsService.create(input);
  }

  @Patch(':couponId')
  @UseGuards(AuthenticatedUserGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('couponId') couponId: string, @Body() input: UpdateCouponDto) {
    return this.couponsService.update(couponId, input);
  }

  @Delete(':couponId')
  @UseGuards(AuthenticatedUserGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deactivate(@Param('couponId') couponId: string) {
    return this.couponsService.deactivate(couponId);
  }
}
