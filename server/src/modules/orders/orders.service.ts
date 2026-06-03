import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CouponType, OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { OtpService } from '../otp/otp.service';
import { PaymentsService } from '../payments/payments.service';
import { CreateCheckoutOrderDto } from './dto/create-checkout-order.dto';
import { ListOrdersQuery } from './dto/list-orders-query.dto';

const FALLBACK_COUPONS = {
  WELCOME10: {
    type: CouponType.PERCENTAGE,
    value: 10,
    minimumAmount: 99,
  },
  SAVE50: {
    type: CouponType.FIXED_AMOUNT,
    value: 50,
    minimumAmount: 299,
  },
} satisfies Record<string, { type: CouponType; value: number; minimumAmount: number }>;

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentsService: PaymentsService,
    private readonly otpService: OtpService,
  ) {}

  async createCheckoutOrder(dto: CreateCheckoutOrderDto) {
    const paymentVerification = this.paymentsService.verifyRazorpayPayment({
      razorpayOrderId: dto.payment.razorpayOrderId,
      razorpayPaymentId: dto.payment.razorpayPaymentId,
      razorpaySignature: dto.payment.razorpaySignature,
    });

    const guestUser = await this.prisma.user.upsert({
      where: { email: 'guest@crumbstall.local' },
      update: { lastActivity: new Date() },
      create: {
        email: 'guest@crumbstall.local',
        name: 'Guest Customer',
        lastActivity: new Date(),
      },
    });

    const foodItemFilters: Prisma.FoodItemWhereInput[] = dto.items.flatMap((item) => {
      const filters: Prisma.FoodItemWhereInput[] = [];

      if (item.foodItemId) {
        filters.push({ id: item.foodItemId });
      }

      if (item.slug) {
        filters.push({ slug: item.slug });
      }

      return filters;
    });

    const foodItems = await this.prisma.foodItem.findMany({
      where: {
        OR: foodItemFilters,
      },
    });

    const orderItems = dto.items.map((item) => {
      const foodItem = foodItems.find(
        (candidate) => candidate.id === item.foodItemId || candidate.slug === item.slug,
      );

      if (!foodItem) {
        throw new BadRequestException(`Food item ${item.slug ?? item.foodItemId} was not found`);
      }

      if (!foodItem.isAvailable) {
        throw new BadRequestException(`${foodItem.name} is currently unavailable`);
      }

      const unitPrice = foodItem.discountPrice?.toNumber() ?? foodItem.price.toNumber();

      return {
        foodItem,
        quantity: item.quantity,
        note: item.note,
        unitPrice,
        totalPrice: unitPrice * item.quantity,
      };
    });

    const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const { coupon, discount } = await this.resolveCoupon(dto.couponCode, subtotal);
    const taxableAmount = Math.max(subtotal - discount, 0);
    const tax = Math.round(taxableAmount * 0.05);
    const total = taxableAmount + tax;
    const pickupTime = new Date(Date.now() + dto.pickupSlot.minutesFromNow * 60_000);
    const orderNumber = `CS-${Date.now()}`;

    const order = await this.prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: guestUser.id,
          couponId: coupon?.id,
          status: OrderStatus.PLACED,
          pickupTime,
          subtotalAmount: subtotal,
          taxAmount: tax,
          discountAmount: discount,
          totalAmount: total,
          estimatedPrepMinutes: dto.pickupSlot.minutesFromNow || 12,
          placedAt: new Date(),
          items: {
            create: orderItems.map((item) => ({
              foodItemId: item.foodItem.id,
              name: item.foodItem.name,
              note: item.note,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
            })),
          },
          payments: {
            create: {
              status: PaymentStatus.CAPTURED,
              amount: total,
              currency: 'INR',
              providerOrderId: dto.payment.razorpayOrderId,
              providerPaymentId: dto.payment.razorpayPaymentId,
              providerSignature: dto.payment.razorpaySignature,
              rawPayload: paymentVerification,
            },
          },
        },
        include: {
          items: true,
          payments: true,
        },
      });

      if (coupon) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
        await tx.couponUsage.create({
          data: {
            couponId: coupon.id,
            userId: guestUser.id,
            orderId: createdOrder.id,
          },
        });
      }

      return createdOrder;
    });

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      pickupTime: order.pickupTime?.toISOString(),
      subtotalAmount: order.subtotalAmount.toNumber(),
      taxAmount: order.taxAmount.toNumber(),
      discountAmount: order.discountAmount.toNumber(),
      totalAmount: order.totalAmount.toNumber(),
      paymentId: order.payments[0]?.providerPaymentId,
      items: order.items.map((item) => ({
        id: item.id,
        name: item.name,
        note: item.note,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toNumber(),
        totalPrice: item.totalPrice.toNumber(),
      })),
    };
  }

  async findByOrderNumber(orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        coupon: {
          select: {
            code: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const pickupOtp = await this.otpService.getDisplayOtpForOrder(order);

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      statusLabel: getOrderStatusLabel(order.status),
      timeline: buildOrderTimeline(order),
      pickupTime: order.pickupTime?.toISOString(),
      placedAt: order.placedAt?.toISOString(),
      completedAt: order.completedAt?.toISOString(),
      subtotalAmount: order.subtotalAmount.toNumber(),
      taxAmount: order.taxAmount.toNumber(),
      discountAmount: order.discountAmount.toNumber(),
      totalAmount: order.totalAmount.toNumber(),
      couponCode: order.coupon?.code ?? null,
      pickupOtp,
      payment: order.payments[0]
        ? {
            status: order.payments[0].status,
            provider: order.payments[0].provider,
            paymentId: order.payments[0].providerPaymentId,
            amount: order.payments[0].amount.toNumber(),
          }
        : null,
      items: order.items.map((item) => ({
        id: item.id,
        name: item.name,
        note: item.note,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toNumber(),
        totalPrice: item.totalPrice.toNumber(),
      })),
    };
  }

  async findRecentGuestOrders(query: ListOrdersQuery) {
    const where: Prisma.OrderWhereInput = {
      AND: [
        {
        user: {
          email: 'guest@crumbstall.local',
        },
        },
        query.status ? { status: query.status } : {},
        query.search
          ? {
              OR: [
                { orderNumber: { contains: query.search, mode: 'insensitive' } },
                { items: { some: { name: { contains: query.search, mode: 'insensitive' } } } },
              ],
            }
          : {},
      ],
    };

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      include: {
        items: true,
      },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        statusLabel: getOrderStatusLabel(order.status),
        placedAt: order.placedAt?.toISOString() ?? order.createdAt.toISOString(),
        pickupTime: order.pickupTime?.toISOString(),
        totalAmount: order.totalAmount.toNumber(),
        itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
        itemPreview: order.items.slice(0, 3).map((item) => item.name),
      })),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  private async resolveCoupon(couponCode: string | undefined, subtotal: number) {
    if (!couponCode) {
      return { coupon: null, discount: 0 };
    }

    const now = new Date();
    const coupon = await this.prisma.coupon.findFirst({
      where: {
        code: couponCode,
        isActive: true,
        startsAt: { lte: now },
        endsAt: { gte: now },
      },
    });

    if (coupon) {
      const minimumAmount = coupon.minimumAmount.toNumber();

      if (subtotal < minimumAmount) {
        throw new BadRequestException(`Minimum order amount for ${coupon.code} is Rs ${minimumAmount}`);
      }

      if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        throw new BadRequestException(`${coupon.code} has reached its usage limit`);
      }

      return {
        coupon,
        discount: calculateCouponDiscount(coupon.type, coupon.value.toNumber(), subtotal),
      };
    }

    const fallbackCoupon = FALLBACK_COUPONS[couponCode as keyof typeof FALLBACK_COUPONS];

    if (!fallbackCoupon) {
      throw new BadRequestException('Coupon code is invalid');
    }

    if (subtotal < fallbackCoupon.minimumAmount) {
      throw new BadRequestException(
        `Minimum order amount for ${couponCode} is Rs ${fallbackCoupon.minimumAmount}`,
      );
    }

    return {
      coupon: null,
      discount: calculateCouponDiscount(fallbackCoupon.type, fallbackCoupon.value, subtotal),
    };
  }
}

const ORDER_TIMELINE: Array<{
  status: OrderStatus;
  label: string;
  description: string;
}> = [
  {
    status: OrderStatus.PLACED,
    label: 'Order placed',
    description: 'We received your paid pickup order.',
  },
  {
    status: OrderStatus.CONFIRMED,
    label: 'Confirmed',
    description: 'The stall accepted your order.',
  },
  {
    status: OrderStatus.PREPARING,
    label: 'Preparing',
    description: 'Your food is being prepared.',
  },
  {
    status: OrderStatus.READY_FOR_PICKUP,
    label: 'Ready for pickup',
    description: 'Show your pickup OTP at the counter.',
  },
  {
    status: OrderStatus.COMPLETED,
    label: 'Completed',
    description: 'Order handover completed.',
  },
];

function buildOrderTimeline(order: {
  status: OrderStatus;
  placedAt: Date | null;
  pickupTime: Date | null;
  completedAt: Date | null;
}) {
  const currentIndex = Math.max(
    ORDER_TIMELINE.findIndex((step) => step.status === order.status),
    order.status === OrderStatus.PAID ? 0 : -1,
  );

  return ORDER_TIMELINE.map((step, index) => {
    const isDone = currentIndex >= index;
    const isCurrent = currentIndex === index;
    const timestamp =
      step.status === OrderStatus.PLACED
        ? order.placedAt
        : step.status === OrderStatus.READY_FOR_PICKUP
          ? order.pickupTime
          : step.status === OrderStatus.COMPLETED
            ? order.completedAt
            : null;

    return {
      status: step.status,
      label: step.label,
      description: step.description,
      state: isCurrent ? 'current' : isDone ? 'done' : 'pending',
      timestamp: timestamp?.toISOString() ?? null,
    };
  });
}

function getOrderStatusLabel(status: OrderStatus) {
  return status
    .split('_')
    .map((word) => word[0] + word.slice(1).toLowerCase())
    .join(' ');
}

function calculateCouponDiscount(type: CouponType, value: number, subtotal: number) {
  if (type === CouponType.PERCENTAGE) {
    return Math.round((subtotal * value) / 100);
  }

  return Math.min(value, subtotal);
}
