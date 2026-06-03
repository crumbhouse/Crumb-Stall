import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthProvider, UserRole } from '@prisma/client';
import { timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../../database/prisma.service';
import { SyncGoogleUserDto } from './dto/sync-google-user.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async syncGoogleUser(input: SyncGoogleUserDto, syncSecret?: string) {
    this.assertValidSyncSecret(syncSecret);

    const user = await this.prisma.user.upsert({
      where: { email: input.email },
      update: {
        name: input.name,
        imageUrl: input.imageUrl,
        provider: AuthProvider.GOOGLE,
        providerId: input.providerId,
        lastActivity: new Date(),
      },
      create: {
        email: input.email,
        name: input.name,
        imageUrl: input.imageUrl,
        provider: AuthProvider.GOOGLE,
        providerId: input.providerId,
        role: UserRole.CUSTOMER,
        lastActivity: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        imageUrl: true,
        role: true,
        isSuspended: true,
      },
    });

    await this.prisma.cart.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });

    return { user };
  }

  private assertValidSyncSecret(syncSecret?: string) {
    const expectedSecret = process.env.AUTH_SYNC_SECRET;

    if (!expectedSecret) {
      if (process.env.NODE_ENV === 'production') {
        throw new InternalServerErrorException('AUTH_SYNC_SECRET is not configured.');
      }

      return;
    }

    if (!syncSecret || !safeEqual(syncSecret, expectedSecret)) {
      throw new UnauthorizedException('Invalid auth sync secret.');
    }
  }
}

function safeEqual(value: string, expected: string) {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);

  if (valueBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(valueBuffer, expectedBuffer);
}
