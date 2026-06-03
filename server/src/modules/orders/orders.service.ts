import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import { timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../../database/prisma.service';
import { CouponsService } from '../coupons/coupons.service';
import { OtpService } from '../otp/otp.service';
import { PaymentsService } from '../payments/payments.service';
import { CreateCheckoutOrderDto } from './dto/create-checkout-order.dto';
import { ListOrdersQuery } from './dto/list-orders-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

const ADMIN_STATUS_UPDATES: OrderStatus[] = [
  OrderStatus.CONFIRMED,
  OrderStatus.PREPARING,
  OrderStatus.READY_FOR_PICKUP,
  OrderStatus.OTP_VERIFICATION_PENDING,
  OrderStatus.COMPLETED,
  OrderStatus.CANCELLED,
];

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly couponsService: CouponsService,
    private readonly paymentsService: PaymentsService,
    private readonly otpService: OtpService,
  ) {}

  async createCheckoutOrder(
    dto: CreateCheckoutOrderDto,
    customerEmail?: string,
    syncSecret?: string,
  ) {
    const paymentVerification = this.paymentsService.verifyRazorpayPayment({
      razorpayOrderId: dto.payment.razorpayOrderId,
      razorpayPaymentId: dto.payment.razorpayPaymentId,
      razorpaySignature: dto.payment.razorpaySignature,
    });

    const customer = await this.resolveCheckoutCustomer(customerEmail, syncSecret);

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
    const { coupon, discount } = await this.couponsService.resolveCouponForOrder(
      dto.couponCode,
      subtotal,
    );
    const taxableAmount = Math.max(subtotal - discount, 0);
    const tax = Math.round(taxableAmount * 0.05);
    const total = taxableAmount + tax;
    const pickupTime = new Date(Date.now() + dto.pickupSlot.minutesFromNow * 60_000);
    const orderNumber = `CS-${Date.now()}`;

    const order = await this.prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: customer.id,
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
            userId: customer.id,
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

  private async resolveCheckoutCustomer(customerEmail?: string, syncSecret?: string) {
    if (!customerEmail) {
      throw new UnauthorizedException('Customer session is required.');
    }

    this.assertValidSyncSecret(syncSecret);

    const user = await this.prisma.user.findUnique({
      where: { email: customerEmail },
      select: {
        id: true,
        isSuspended: true,
      },
    });

    if (!user || user.isSuspended) {
      throw new UnauthorizedException('Customer session is invalid.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastActivity: new Date() },
    });

    return user;
  }

  private assertValidSyncSecret(syncSecret?: string) {
    const expectedSecret = process.env.AUTH_SYNC_SECRET;

    if (!expectedSecret) {
      if (process.env.NODE_ENV === 'production') {
        throw new InternalServerErrorException('AUTH_SYNC_SECRET is not configured.');
      }

      return;
    }

    if (!syncSecret || !safeEqual(syncSecret, expectedSecret)) {
      throw new UnauthorizedException('Invalid auth sync secret.');
    }
  }

  async findByOrderNumber(orderNumber: string, customerEmail?: string, syncSecret?: string) {
    const customer = await this.resolveOrderReader(customerEmail, syncSecret);
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

    if (customer && order.userId !== customer.id) {
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

  async findRecentOrders(query: ListOrdersQuery, customerEmail?: string, syncSecret?: string) {
    const customer = await this.resolveOrderReader(customerEmail, syncSecret);
    const where: Prisma.OrderWhereInput = {
      AND: [
        { userId: customer.id },
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

  async findAdminOrders(query: ListOrdersQuery) {
    const where: Prisma.OrderWhereInput = {
      AND: [
        query.status ? { status: query.status } : {},
        query.search
          ? {
              OR: [
                { orderNumber: { contains: query.search, mode: 'insensitive' } },
                { user: { email: { contains: query.search, mode: 'insensitive' } } },
                { user: { name: { contains: query.search, mode: 'insensitive' } } },
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
          user: {
            select: {
              name: true,
              email: true,
            },
          },
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
        customer: {
          name: order.user.name,
          email: order.user.email,
        },
      })),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
      allowedStatusUpdates: ADMIN_STATUS_UPDATES,
    };
  }

  async updateStatus(orderNumber: string, input: UpdateOrderStatusDto) {
    if (!ADMIN_STATUS_UPDATES.includes(input.status)) {
      throw new BadRequestException(
        `status must be one of: ${ADMIN_STATUS_UPDATES.join(', ')}`,
      );
    }

    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      select: {
        id: true,
        status: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: input.status,
        completedAt: input.status === OrderStatus.COMPLETED ? new Date() : null,
        cancelledAt: input.status === OrderStatus.CANCELLED ? new Date() : null,
      },
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

    return {
      id: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      status: updatedOrder.status,
      statusLabel: getOrderStatusLabel(updatedOrder.status),
      timeline: buildOrderTimeline(updatedOrder),
      pickupTime: updatedOrder.pickupTime?.toISOString(),
      placedAt: updatedOrder.placedAt?.toISOString(),
      completedAt: updatedOrder.completedAt?.toISOString(),
      subtotalAmount: updatedOrder.subtotalAmount.toNumber(),
      taxAmount: updatedOrder.taxAmount.toNumber(),
      discountAmount: updatedOrder.discountAmount.toNumber(),
      totalAmount: updatedOrder.totalAmount.toNumber(),
      couponCode: updatedOrder.coupon?.code ?? null,
      payment: updatedOrder.payments[0]
        ? {
            status: updatedOrder.payments[0].status,
            provider: updatedOrder.payments[0].provider,
            paymentId: updatedOrder.payments[0].providerPaymentId,
            amount: updatedOrder.payments[0].amount.toNumber(),
          }
        : null,
      items: updatedOrder.items.map((item) => ({
        id: item.id,
        name: item.name,
        note: item.note,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toNumber(),
        totalPrice: item.totalPrice.toNumber(),
      })),
    };
  }

  private async resolveOrderReader(customerEmail?: string, syncSecret?: string) {
    if (!customerEmail) {
      throw new UnauthorizedException('Customer session is required.');
    }

    this.assertValidSyncSecret(syncSecret);

    const user = await this.prisma.user.findUnique({
      where: { email: customerEmail },
      select: {
        id: true,
        isSuspended: true,
      },
    });

    if (!user || user.isSuspended) {
      throw new UnauthorizedException('Customer session is invalid.');
    }

    return user;
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

function safeEqual(value: string, expected: string) {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);

  if (valueBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(valueBuffer, expectedBuffer);
}
