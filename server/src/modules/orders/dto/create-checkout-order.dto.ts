import { BadRequestException } from '@nestjs/common';

export type CheckoutOrderItemDto = {
  foodItemId?: string;
  slug?: string;
  quantity: number;
  note?: string;
};

export type CreateCheckoutOrderDto = {
  items: CheckoutOrderItemDto[];
  couponCode?: string;
  pickupSlot: {
    id: string;
    label: string;
    minutesFromNow: number;
  };
  payment: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  };
};

export function parseCreateCheckoutOrderDto(body: Record<string, unknown>): CreateCheckoutOrderDto {
  if (!Array.isArray(body.items) || body.items.length === 0) {
    throw new BadRequestException('items must contain at least one item');
  }

  const items = body.items.map((item) => parseOrderItem(item));
  const pickupSlot = parsePickupSlot(body.pickupSlot);
  const payment = parsePayment(body.payment);
  const couponCode =
    typeof body.couponCode === 'string' && body.couponCode.trim()
      ? body.couponCode.trim().toUpperCase()
      : undefined;

  return {
    items,
    couponCode,
    pickupSlot,
    payment,
  };
}

function parseOrderItem(value: unknown): CheckoutOrderItemDto {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new BadRequestException('Each item must be an object');
  }

  const record = value as Record<string, unknown>;
  const foodItemId = typeof record.foodItemId === 'string' ? record.foodItemId.trim() : undefined;
  const slug = typeof record.slug === 'string' ? record.slug.trim() : undefined;
  const quantity = Number(record.quantity);
  const note = typeof record.note === 'string' ? record.note.trim().slice(0, 120) : undefined;

  if (!foodItemId && !slug) {
    throw new BadRequestException('Each item requires foodItemId or slug');
  }

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
    throw new BadRequestException('Item quantity must be between 1 and 20');
  }

  return {
    foodItemId,
    slug,
    quantity,
    note,
  };
}

function parsePickupSlot(value: unknown): CreateCheckoutOrderDto['pickupSlot'] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new BadRequestException('pickupSlot is required');
  }

  const record = value as Record<string, unknown>;
  const id = typeof record.id === 'string' ? record.id.trim() : '';
  const label = typeof record.label === 'string' ? record.label.trim() : '';
  const minutesFromNow = Number(record.minutesFromNow);

  if (!id || !label || !Number.isInteger(minutesFromNow) || minutesFromNow < 0 || minutesFromNow > 120) {
    throw new BadRequestException('pickupSlot is invalid');
  }

  return {
    id,
    label,
    minutesFromNow,
  };
}

function parsePayment(value: unknown): CreateCheckoutOrderDto['payment'] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new BadRequestException('payment is required');
  }

  const record = value as Record<string, unknown>;
  const razorpayOrderId = readString(record.razorpayOrderId, 'payment.razorpayOrderId');
  const razorpayPaymentId = readString(record.razorpayPaymentId, 'payment.razorpayPaymentId');
  const razorpaySignature = readString(record.razorpaySignature, 'payment.razorpaySignature');

  return {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  };
}

function readString(value: unknown, field: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new BadRequestException(`${field} is required`);
  }

  return value.trim();
}
