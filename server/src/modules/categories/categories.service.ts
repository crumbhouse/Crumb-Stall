import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: {
            foodItems: {
              where: { isAvailable: true },
            },
          },
        },
      },
    });

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      imageUrl: category.imageUrl,
      sortOrder: category.sortOrder,
      foodItemCount: category._count.foodItems,
    }));
  }
}
