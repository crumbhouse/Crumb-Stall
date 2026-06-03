import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { parseReviewInput } from './dto/review-input.dto';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('foods/:slug')
  findForFood(@Param('slug') slug: string) {
    return this.reviewsService.findForFood(slug);
  }

  @Post('foods/:slug')
  upsertForFood(@Param('slug') slug: string, @Body() body: Record<string, unknown>) {
    return this.reviewsService.upsertForFood(slug, parseReviewInput(body));
  }
}
