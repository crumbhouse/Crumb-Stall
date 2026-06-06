import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthenticatedUserGuard } from '../../common/auth/authenticated-user.guard';
import { Roles } from '../../common/auth/roles.decorator';
import { RolesGuard } from '../../common/auth/roles.guard';
import { CreateFoodItemDto, UpdateFoodItemDto } from './dto/food-input.dto';
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

  @Get('admin')
  @UseGuards(AuthenticatedUserGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAllForAdmin() {
    return this.foodService.findAllForAdmin();
  }

  @Post()
  @UseGuards(AuthenticatedUserGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() body: CreateFoodItemDto) {
    return this.foodService.create(body);
  }

  @Patch(':foodItemId')
  @UseGuards(AuthenticatedUserGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Param('foodItemId') foodItemId: string,
    @Body() body: UpdateFoodItemDto,
  ) {
    return this.foodService.update(foodItemId, body);
  }

  @Delete(':foodItemId')
  @UseGuards(AuthenticatedUserGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deactivate(@Param('foodItemId') foodItemId: string) {
    return this.foodService.deactivate(foodItemId);
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.foodService.findBySlug(slug);
  }
}
