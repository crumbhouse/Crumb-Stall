import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { getFoodOrderBy, ListFoodQuery } from './dto/list-food-query.dto';

const foodInclude = {
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
} satisfies Prisma.FoodItemInclude;

@Injectable()
export class FoodService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListFoodQuery) {
    const where = this.buildWhere(query);
    const [items, total] = await this.prisma.$transaction([
      this.prisma.foodItem.findMany({
        where,
        include: foodInclude,
        orderBy: getFoodOrderBy(query.sort),
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.foodItem.count({ where }),
    ]);

    return {
      data: items.map((item) => this.serializeFoodItem(item)),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async findFeatured(limit = 8) {
    const items = await this.prisma.foodItem.findMany({
      where: {
        isAvailable: true,
        isFeatured: true,
      },
      include: foodInclude,
      orderBy: [{ popularity: 'desc' }, { name: 'asc' }],
      take: limit,
    });

    return items.map((item) => this.serializeFoodItem(item));
  }

  async findPopular(limit = 8) {
    const items = await this.prisma.foodItem.findMany({
      where: { isAvailable: true },
      include: foodInclude,
      orderBy: [{ popularity: 'desc' }, { ratingAverage: 'desc' }, { name: 'asc' }],
      take: limit,
    });

    return items.map((item) => this.serializeFoodItem(item));
  }

  async findBySlug(slug: string) {
    const item = await this.prisma.foodItem.findUnique({
      where: { slug },
      include: foodInclude,
    });

    if (!item) {
      throw new NotFoundException('Food item not found');
    }

    return this.serializeFoodItem(item);
  }

  private buildWhere(query: ListFoodQuery): Prisma.FoodItemWhereInput {
    const and: Prisma.FoodItemWhereInput[] = [];

    if (query.search) {
      and.push({
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
          { tags: { has: query.search } },
          { category: { name: { contains: query.search, mode: 'insensitive' } } },
        ],
      });
    }

    if (query.category) {
      and.push({ category: { slug: query.category } });
    }

    if (query.type) {
      and.push({ type: query.type });
    }

    if (query.available !== undefined) {
      and.push({ isAvailable: query.available });
    }

    if (query.featured !== undefined) {
      and.push({ isFeatured: query.featured });
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      and.push({
        price: {
          gte: query.minPrice,
          lte: query.maxPrice,
        },
      });
    }

    return and.length > 0 ? { AND: and } : {};
  }

  private serializeFoodItem(item: Prisma.FoodItemGetPayload<{ include: typeof foodInclude }>) {
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
}
