import { Body, Controller, Get, Headers, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedUserGuard } from '../../common/auth/authenticated-user.guard';
import type { AuthenticatedRequest } from '../../common/auth/authenticated-user.guard';
import { parseReviewInput } from './dto/review-input.dto';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('foods/:slug')
  findForFood(
    @Param('slug') slug: string,
    @Headers('x-customer-email') customerEmail?: string,
    @Headers('x-auth-sync-secret') syncSecret?: string,
  ) {
    return this.reviewsService.findForFood(slug, customerEmail, syncSecret);
  }

  @Post('foods/:slug')
  @UseGuards(AuthenticatedUserGuard)
  upsertForFood(
    @Param('slug') slug: string,
    @Body() body: Record<string, unknown>,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.reviewsService.upsertForFood(slug, parseReviewInput(body), request.user!.id);
  }
}
