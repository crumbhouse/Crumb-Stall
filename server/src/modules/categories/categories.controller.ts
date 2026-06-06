import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthenticatedUserGuard } from '../../common/auth/authenticated-user.guard';
import { Roles } from '../../common/auth/roles.decorator';
import { RolesGuard } from '../../common/auth/roles.guard';
import { CategoriesService } from './categories.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto/category-input.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get('admin')
  @UseGuards(AuthenticatedUserGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAllForAdmin() {
    return this.categoriesService.findAllForAdmin();
  }

  @Post()
  @UseGuards(AuthenticatedUserGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() body: CreateCategoryDto) {
    return this.categoriesService.create(body);
  }

  @Patch(':categoryId')
  @UseGuards(AuthenticatedUserGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Param('categoryId') categoryId: string,
    @Body() body: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(categoryId, body);
  }

  @Delete(':categoryId')
  @UseGuards(AuthenticatedUserGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deactivate(@Param('categoryId') categoryId: string) {
    return this.categoriesService.deactivate(categoryId);
  }
}
