import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

const GUEST_EMAIL = 'guest@crumbstall.local';

const favoriteFoodInclude = {
  foodItem: {
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  },
} satisfies Prisma.FavoriteInclude;

type FavoriteRecord = Prisma.FavoriteGetPayload<{ include: typeof favoriteFoodInclude }>;

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForGuest() {
    const user = await this.ensureGuestUser();
    const favorites = await this.prisma.favorite.findMany({
      where: { userId: user.id },
      include: favoriteFoodInclude,
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: favorites.map((favorite) => serializeFoodItem(favorite.foodItem)),
    };
  }

  async findIdsForGuest() {
    const user = await this.ensureGuestUser();
    const favorites = await this.prisma.favorite.findMany({
      where: { userId: user.id },
      select: {
        foodItemId: true,
        foodItem: {
          select: {
            slug: true,
          },
        },
      },
    });

    return {
      foodItemIds: favorites.map((favorite) => favorite.foodItemId),
      slugs: favorites.map((favorite) => favorite.foodItem.slug),
    };
  }

  async addForGuest(slug: string) {
    const user = await this.ensureGuestUser();
    const foodItem = await this.prisma.foodItem.findUnique({
      where: { slug },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!foodItem) {
      throw new NotFoundException('Food item not found');
    }

    await this.prisma.favorite.upsert({
      where: {
        userId_foodItemId: {
          userId: user.id,
          foodItemId: foodItem.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        foodItemId: foodItem.id,
      },
    });

    return {
      item: serializeFoodItem(foodItem),
      isFavorite: true,
    };
  }

  async removeForGuest(slug: string) {
    const user = await this.ensureGuestUser();
    const favorite = await this.prisma.favorite.findFirst({
      where: {
        userId: user.id,
        foodItem: { slug },
      },
    });

    if (favorite) {
      await this.prisma.favorite.delete({
        where: { id: favorite.id },
      });
    }

    return {
      slug,
      isFavorite: false,
    };
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

function serializeFoodItem(item: FavoriteRecord['foodItem']) {
  const price = item.price.toNumber();
  const discountPrice = item.discountPrice?.toNumber() ?? null;

  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    description: item.description,
    ingredients: item.ingredients,
    price,
    discountPrice,
    finalPrice: discountPrice ?? price,
    imageUrl: item.imageUrl,
    tags: item.tags,
    type: item.type,
    ratingAverage: item.ratingAverage.toNumber(),
    ratingCount: item.ratingCount,
    popularity: item.popularity,
    isAvailable: item.isAvailable,
    isFeatured: item.isFeatured,
    category: item.category,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}
