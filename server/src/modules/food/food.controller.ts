import { Controller, Get, Param, Query } from '@nestjs/common';
import { parseListFoodQuery } from './dto/list-food-query.dto';
import { FoodService } from './food.service';

@Controller('foods')
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  @Get()
  findAll(@Query() query: Record<string, unknown>) {
    return this.foodService.findAll(parseListFoodQuery(query));
  }

  @Get('featured')
  findFeatured() {
    return this.foodService.findFeatured();
  }

  @Get('popular')
  findPopular() {
    return this.foodService.findPopular();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.foodService.findBySlug(slug);
  }
}
