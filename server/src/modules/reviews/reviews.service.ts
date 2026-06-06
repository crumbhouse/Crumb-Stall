import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../../database/prisma.service';
import { ReviewInput } from './dto/review-input.dto';

const PURCHASED_STATUSES = [
  OrderStatus.PAID,
  OrderStatus.PLACED,
  OrderStatus.CONFIRMED,
  OrderStatus.PREPARING,
  OrderStatus.READY_FOR_PICKUP,
  OrderStatus.OTP_VERIFICATION_PENDING,
  OrderStatus.COMPLETED,
];

const reviewInclude = {
  user: {
    select: {
      name: true,
      imageUrl: true,
    },
  },
} satisfies Prisma.ReviewInclude;

type ReviewRecord = Prisma.ReviewGetPayload<{ include: typeof reviewInclude }>;

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async findForFood(slug: string, customerEmail?: string, syncSecret?: string) {
    const [user, foodItem] = await Promise.all([
      this.resolveOptionalUser(customerEmail, syncSecret),
      this.prisma.foodItem.findUnique({
        where: { slug },
        select: {
          id: true,
          name: true,
          ratingAverage: true,
          ratingCount: true,
        },
      }),
    ]);

    if (!foodItem) {
      throw new NotFoundException('Food item not found');
    }

    const [reviews, canReview, myReview] = await Promise.all([
      this.prisma.review.findMany({
        where: {
          foodItemId: foodItem.id,
          isHidden: false,
        },
        include: reviewInclude,
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      user ? this.hasPurchasedFood(user.id, foodItem.id) : false,
      user
        ? this.prisma.review.findUnique({
            where: {
              userId_foodItemId: {
                userId: user.id,
                foodItemId: foodItem.id,
              },
            },
            include: reviewInclude,
          })
        : null,
    ]);

    return {
      summary: {
        ratingAverage: foodItem.ratingAverage.toNumber(),
        ratingCount: foodItem.ratingCount,
      },
      canReview,
      myReview: myReview ? serializeReview(myReview) : null,
      data: reviews.map(serializeReview),
    };
  }

  async upsertForFood(slug: string, input: ReviewInput, userId: string) {
    const foodItem = await this.prisma.foodItem.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!foodItem) {
      throw new NotFoundException('Food item not found');
    }

    const hasPurchased = await this.hasPurchasedFood(userId, foodItem.id);

    if (!hasPurchased) {
      throw new ForbiddenException('Only purchased items can be reviewed');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.review.upsert({
        where: {
          userId_foodItemId: {
            userId,
            foodItemId: foodItem.id,
          },
        },
        update: {
          rating: input.rating,
          comment: input.comment,
          isHidden: false,
        },
        create: {
          userId,
          foodItemId: foodItem.id,
          rating: input.rating,
          comment: input.comment,
        },
      });

      const aggregate = await tx.review.aggregate({
        where: {
          foodItemId: foodItem.id,
          isHidden: false,
        },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await tx.foodItem.update({
        where: { id: foodItem.id },
        data: {
          ratingAverage: new Prisma.Decimal(
            (aggregate._avg.rating ?? 0).toFixed(2),
          ),
          ratingCount: aggregate._count.rating,
        },
      });
    });

    return this.findForFoodByUserId(slug, userId);
  }

  private hasPurchasedFood(userId: string, foodItemId: string) {
    return this.prisma.order
      .findFirst({
        where: {
          userId,
          status: { in: PURCHASED_STATUSES },
          items: {
            some: { foodItemId },
          },
        },
        select: { id: true },
      })
      .then(Boolean);
  }

  private async findForFoodByUserId(slug: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    return this.findForFood(slug, user?.email, process.env.AUTH_SYNC_SECRET);
  }

  private async resolveOptionalUser(
    customerEmail?: string,
    syncSecret?: string,
  ) {
    if (!customerEmail) {
      return null;
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

  private assertValidSyncSecret(syncSecret?: string) {
    const expectedSecret = process.env.AUTH_SYNC_SECRET;

    if (!expectedSecret) {
      if (process.env.NODE_ENV === 'production') {
        throw new InternalServerErrorException(
          'AUTH_SYNC_SECRET is not configured.',
        );
      }

      return;
    }

    if (!syncSecret || !safeEqual(syncSecret, expectedSecret)) {
      throw new UnauthorizedException('Invalid auth sync secret.');
    }
  }
}

function safeEqual(value: string, expected: string) {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);

  if (valueBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(valueBuffer, expectedBuffer);
}

function serializeReview(review: ReviewRecord) {
  return {
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt.toISOString(),
    user: {
      name: review.user.name ?? 'Crumb Stall customer',
      imageUrl: review.user.imageUrl,
    },
  };
}
