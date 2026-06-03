import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  findAll() {
    return this.favoritesService.findAllForGuest();
  }

  @Get('ids')
  findIds() {
    return this.favoritesService.findIdsForGuest();
  }

  @Post(':slug')
  add(@Param('slug') slug: string) {
    return this.favoritesService.addForGuest(slug);
  }

  @Delete(':slug')
  remove(@Param('slug') slug: string) {
    return this.favoritesService.removeForGuest(slug);
  }
}
