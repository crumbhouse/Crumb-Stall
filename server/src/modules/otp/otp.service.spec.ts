import { OrderStatus } from '@prisma/client';
import { OtpService } from './otp.service';

const notifications = {
  create: jest.fn(),
};

describe('OtpService', () => {
  beforeEach(() => {
    notifications.create.mockClear();
  });

  it('does not expose an OTP before an order is ready', async () => {
    const prisma = {
      orderOtp: {
        findUnique: jest.fn(),
      },
    };
    const service = new OtpService(prisma as never, notifications as never);

    await expect(
      service.getDisplayOtpForOrder({ id: 'order-1', status: OrderStatus.PLACED }),
    ).resolves.toBeNull();
    expect(prisma.orderOtp.findUnique).not.toHaveBeenCalled();
  });

  it('returns a six digit OTP for ready orders without storing the raw code', async () => {
    const prisma = {
      orderOtp: {
        findUnique: jest.fn().mockResolvedValue(null),
        upsert: jest.fn().mockImplementation(({ create }) =>
          Promise.resolve({
            ...create,
            attemptCount: 0,
          }),
        ),
      },
    };
    const service = new OtpService(prisma as never, notifications as never);
    const otp = await service.getDisplayOtpForOrder({
      id: 'order-1',
      status: OrderStatus.READY_FOR_PICKUP,
    });

    expect(otp?.code).toMatch(/^\d{6}$/);
    expect(prisma.orderOtp.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          otpHash: expect.not.stringMatching(otp?.code ?? ''),
        }),
      }),
    );
  });

  it('verifies a valid OTP and completes the order', async () => {
    let storedOtp: Record<string, unknown> | null = null;
    const prisma = {
      order: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'order-1',
          userId: 'user-1',
          status: OrderStatus.READY_FOR_PICKUP,
        }),
        update: jest.fn(),
      },
      orderOtp: {
        findUnique: jest.fn().mockImplementation(() => Promise.resolve(storedOtp)),
        upsert: jest.fn().mockImplementation(({ create }) => {
          storedOtp = {
            id: 'otp-1',
            ...create,
            attemptCount: 0,
            verifiedAt: null,
          };

          return Promise.resolve(storedOtp);
        }),
        update: jest.fn(),
      },
      $transaction: jest.fn().mockResolvedValue([]),
    };
    const service = new OtpService(prisma as never, notifications as never);
    const otp = await service.generateForOrderNumber('CS-1');
    const result = await service.verifyForOrderNumber('CS-1', otp?.code ?? '');

    expect(result).toMatchObject({
      verified: true,
      status: OrderStatus.COMPLETED,
    });
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it('increments attempt count for invalid OTPs', async () => {
    const future = new Date(Date.now() + 60_000);
    const prisma = {
      order: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'order-1',
          userId: 'user-1',
          status: OrderStatus.READY_FOR_PICKUP,
        }),
      },
      orderOtp: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'otp-1',
          orderId: 'order-1',
          otpHash: 'not-the-right-hash',
          expiresAt: future,
          verifiedAt: null,
          attemptCount: 0,
        }),
        update: jest.fn().mockResolvedValue({ attemptCount: 1 }),
      },
    };
    const service = new OtpService(prisma as never, notifications as never);

    await expect(service.verifyForOrderNumber('CS-1', '123456')).rejects.toThrow('Invalid OTP');
    expect(prisma.orderOtp.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { attemptCount: { increment: 1 } },
      }),
    );
  });
});
