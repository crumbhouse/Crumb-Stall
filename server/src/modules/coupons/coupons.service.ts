import { BadRequestException, Injectable } from '@nestjs/common';
import { Coupon, CouponType } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { ValidateCouponDto } from './dto/validate-coupon.dto';

const TAX_RATE = 0.05;

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  async validateCoupon(input: ValidateCouponDto) {
    const normalizedCode = input.code.trim().toUpperCase();

    if (!normalizedCode) {
      throw new BadRequestException('Coupon code is required.');
    }

    const coupon = await this.findActiveCoupon(normalizedCode);
    const discount = this.calculateDiscount(coupon, input.subtotal);
    const taxableAmount = Math.max(input.subtotal - discount, 0);
    const tax = Math.round(taxableAmount * TAX_RATE);

    return {
      coupon: this.serializeCoupon(coupon),
      discount,
      subtotal: input.subtotal,
      taxableAmount,
      tax,
      total: taxableAmount + tax,
      message: `${coupon.code} applied successfully.`,
    };
  }

  async resolveCouponForOrder(code: string | undefined, subtotal: number) {
    if (!code) {
      return { coupon: null, discount: 0 };
    }

    const coupon = await this.findActiveCoupon(code.trim().toUpperCase());

    return {
      coupon,
      discount: this.calculateDiscount(coupon, subtotal),
    };
  }

  private async findActiveCoupon(code: string) {
    const now = new Date();
    const coupon = await this.prisma.coupon.findFirst({
      where: {
        code,
        isActive: true,
        startsAt: { lte: now },
        endsAt: { gte: now },
      },
    });

    if (!coupon) {
      throw new BadRequestException('Coupon code is invalid.');
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException(`${coupon.code} has reached its usage limit.`);
    }

    return coupon;
  }

  private calculateDiscount(coupon: Coupon, subtotal: number) {
    const minimumAmount = coupon.minimumAmount.toNumber();

    if (subtotal < minimumAmount) {
      throw new BadRequestException(`Add Rs ${minimumAmount - subtotal} more to use ${coupon.code}.`);
    }

    const value = coupon.value.toNumber();

    if (coupon.type === CouponType.PERCENTAGE) {
      return Math.round((subtotal * value) / 100);
    }

    return Math.min(value, subtotal);
  }

  private serializeCoupon(coupon: Coupon) {
    return {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value.toNumber(),
      minimumAmount: coupon.minimumAmount.toNumber(),
      startsAt: coupon.startsAt.toISOString(),
      endsAt: coupon.endsAt.toISOString(),
      usageLimit: coupon.usageLimit,
      usedCount: coupon.usedCount,
    };
  }
}
