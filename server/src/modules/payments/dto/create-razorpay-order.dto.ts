import { BadRequestException } from '@nestjs/common';

export type CreateRazorpayOrderDto = {
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
};

export function parseCreateRazorpayOrderDto(body: Record<string, unknown>): CreateRazorpayOrderDto {
  const amount = Number(body.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new BadRequestException('amount must be a positive number in rupees');
  }

  if (amount < 1) {
    throw new BadRequestException('amount must be at least Rs 1');
  }

  const currency = typeof body.currency === 'string' && body.currency ? body.currency : 'INR';
  const receipt = typeof body.receipt === 'string' && body.receipt ? body.receipt : undefined;
  const notes = isStringRecord(body.notes) ? body.notes : undefined;

  return {
    amount,
    currency,
    receipt,
    notes,
  };
}

function isStringRecord(value: unknown): value is Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every((entry) => typeof entry === 'string');
}
