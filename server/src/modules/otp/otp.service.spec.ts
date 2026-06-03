import { OrderStatus } from '@prisma/client';
import { OtpService } from './otp.service';

describe('OtpService', () => {
  it('does not expose an OTP before an order is ready', async () => {
    const prisma = {
      orderOtp: {
        findUnique: jest.fn(),
      },
    };
    const service = new OtpService(prisma as never);

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
    const service = new OtpService(prisma as never);
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
});
