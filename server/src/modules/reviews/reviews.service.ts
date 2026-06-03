import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { ReviewInput } from './dto/review-input.dto';

const GUEST_EMAIL = 'guest@crumbstall.local';
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

  async findForFood(slug: string) {
    const [user, foodItem] = await Promise.all([
      this.ensureGuestUser(),
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
      this.hasPurchasedFood(user.id, foodItem.id),
      this.prisma.review.findUnique({
        where: {
          userId_foodItemId: {
            userId: user.id,
            foodItemId: foodItem.id,
          },
        },
        include: reviewInclude,
      }),
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

  async upsertForFood(slug: string, input: ReviewInput) {
    const [user, foodItem] = await Promise.all([
      this.ensureGuestUser(),
      this.prisma.foodItem.findUnique({
        where: { slug },
        select: { id: true },
      }),
    ]);

    if (!foodItem) {
      throw new NotFoundException('Food item not found');
    }

    const hasPurchased = await this.hasPurchasedFood(user.id, foodItem.id);

    if (!hasPurchased) {
      throw new ForbiddenException('Only purchased items can be reviewed');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.review.upsert({
        where: {
          userId_foodItemId: {
            userId: user.id,
            foodItemId: foodItem.id,
          },
        },
        update: {
          rating: input.rating,
          comment: input.comment,
          isHidden: false,
        },
        create: {
          userId: user.id,
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
          ratingAverage: new Prisma.Decimal((aggregate._avg.rating ?? 0).toFixed(2)),
          ratingCount: aggregate._count.rating,
        },
      });
    });

    return this.findForFood(slug);
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

  private ensureGuestUser() {
    return this.prisma.user.upsert({
      where: { email: GUEST_EMAIL },
      update: { lastActivity: new Date() },
      create: {
        email: GUEST_EMAIL,
        name: 'Guest Customer',
        lastActivity: new Date(),
      },
    });
  }
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
