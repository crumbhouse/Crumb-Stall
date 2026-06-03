import { Body, Controller, Headers, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SyncGoogleUserDto } from './dto/sync-google-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google/sync')
  syncGoogleUser(
    @Body() input: SyncGoogleUserDto,
    @Headers('x-auth-sync-secret') syncSecret?: string,
  ) {
    return this.authService.syncGoogleUser(input, syncSecret);
  }
}
