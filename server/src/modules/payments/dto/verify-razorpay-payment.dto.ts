import { BadRequestException } from '@nestjs/common';

export type VerifyRazorpayPaymentDto = {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
};

export function parseVerifyRazorpayPaymentDto(
  body: Record<string, unknown>,
): VerifyRazorpayPaymentDto {
  const razorpayOrderId = readRequiredString(body.razorpayOrderId, 'razorpayOrderId');
  const razorpayPaymentId = readRequiredString(body.razorpayPaymentId, 'razorpayPaymentId');
  const razorpaySignature = readRequiredString(body.razorpaySignature, 'razorpaySignature');

  return {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  };
}

function readRequiredString(value: unknown, field: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new BadRequestException(`${field} is required`);
  }

  return value.trim();
}
