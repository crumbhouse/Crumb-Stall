import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthenticatedUserGuard } from '../../common/auth/authenticated-user.guard';
import { Roles } from '../../common/auth/roles.decorator';
import { RolesGuard } from '../../common/auth/roles.guard';
import { VerifyOrderOtpDto } from './dto/verify-order-otp.dto';
import { OtpService } from './otp.service';

@Controller('orders/:orderNumber/otp')
@UseGuards(AuthenticatedUserGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('generate')
  generate(@Param('orderNumber') orderNumber: string) {
    return this.otpService.generateForOrderNumber(orderNumber, {
      forceRefresh: true,
    });
  }

  @Post('verify')
  verify(
    @Param('orderNumber') orderNumber: string,
    @Body() body: VerifyOrderOtpDto,
  ) {
    return this.otpService.verifyForOrderNumber(orderNumber, body.otp);
  }
}
