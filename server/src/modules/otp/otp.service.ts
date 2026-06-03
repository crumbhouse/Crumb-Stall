import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { createHmac } from 'node:crypto';
import { OTP_EXPIRY_MINUTES } from '../../common/constants/app.constants';
import { PrismaService } from '../../database/prisma.service';

type OtpOrder = {
  id: string;
  status: OrderStatus;
};

@Injectable()
export class OtpService {
  constructor(private readonly prisma: PrismaService) {}

  async getDisplayOtpForOrder(order: OtpOrder) {
    if (
      order.status !== OrderStatus.READY_FOR_PICKUP &&
      order.status !== OrderStatus.OTP_VERIFICATION_PENDING
    ) {
      return null;
    }

    const now = new Date();
    const existingOtp = await this.prisma.orderOtp.findUnique({
      where: { orderId: order.id },
    });

    if (existingOtp && !existingOtp.verifiedAt && existingOtp.expiresAt > now) {
      return {
        code: deriveOtp(order.id, existingOtp.expiresAt),
        expiresAt: existingOtp.expiresAt.toISOString(),
        attemptCount: existingOtp.attemptCount,
      };
    }

    const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60_000);
    const code = deriveOtp(order.id, expiresAt);

    const otp = await this.prisma.orderOtp.upsert({
      where: { orderId: order.id },
      update: {
        otpHash: hashOtp(order.id, code),
        expiresAt,
        verifiedAt: null,
        attemptCount: 0,
      },
      create: {
        orderId: order.id,
        otpHash: hashOtp(order.id, code),
        expiresAt,
      },
    });

    return {
      code,
      expiresAt: otp.expiresAt.toISOString(),
      attemptCount: otp.attemptCount,
    };
  }
}

function deriveOtp(orderId: string, expiresAt: Date) {
  const secret = getOtpSecret();
  const digest = createHmac('sha256', secret)
    .update(`${orderId}:${expiresAt.toISOString()}`)
    .digest('hex');
  const value = Number.parseInt(digest.slice(0, 8), 16) % 1_000_000;

  return value.toString().padStart(6, '0');
}

function hashOtp(orderId: string, otp: string) {
  return createHmac('sha256', getOtpSecret()).update(`${orderId}:${otp}`).digest('hex');
}

function getOtpSecret() {
  return process.env.OTP_SECRET ?? process.env.JWT_SECRET ?? 'crumbstall-dev-otp-secret';
}
