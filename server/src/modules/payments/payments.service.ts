import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { DEFAULT_CURRENCY } from '../../common/constants/app.constants';
import { CreateRazorpayOrderDto } from './dto/create-razorpay-order.dto';
import { VerifyRazorpayPaymentDto } from './dto/verify-razorpay-payment.dto';

type RazorpayOrderResponse = {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
};

@Injectable()
export class PaymentsService {
  async createRazorpayOrder(dto: CreateRazorpayOrderDto) {
    const amountInPaise = Math.round(dto.amount * 100);
    const currency = dto.currency ?? DEFAULT_CURRENCY;
    const receipt = dto.receipt ?? `CS-${Date.now()}`;
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return {
        mode: 'mock' as const,
        keyId: 'rzp_test_mock_key',
        orderId: `order_mock_${Date.now()}`,
        amount: amountInPaise,
        currency,
        receipt,
      };
    }

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency,
        receipt,
        notes: dto.notes,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new InternalServerErrorException({
        message: 'Failed to create Razorpay order',
        details: errorBody,
      });
    }

    const order = (await response.json()) as RazorpayOrderResponse;

    return {
      mode: 'live' as const,
      keyId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
    };
  }

  verifyRazorpayPayment(dto: VerifyRazorpayPaymentDto) {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      if (
        dto.razorpayOrderId.startsWith('order_mock_') &&
        dto.razorpayPaymentId.startsWith('pay_mock_') &&
        dto.razorpaySignature === 'mock_signature'
      ) {
        return {
          mode: 'mock' as const,
          verified: true,
          orderId: dto.razorpayOrderId,
          paymentId: dto.razorpayPaymentId,
        };
      }

      throw new BadRequestException('Invalid mock payment verification payload');
    }

    const expectedSignature = createHmac('sha256', keySecret)
      .update(`${dto.razorpayOrderId}|${dto.razorpayPaymentId}`)
      .digest('hex');

    const actual = Buffer.from(dto.razorpaySignature);
    const expected = Buffer.from(expectedSignature);
    const verified = actual.length === expected.length && timingSafeEqual(actual, expected);

    if (!verified) {
      throw new BadRequestException('Razorpay payment signature verification failed');
    }

    return {
      mode: 'live' as const,
      verified: true,
      orderId: dto.razorpayOrderId,
      paymentId: dto.razorpayPaymentId,
    };
  }
}
