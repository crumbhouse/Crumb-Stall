import { PaymentsService } from './payments.service';

describe('PaymentsService', () => {
  const previousSecret = process.env.RAZORPAY_KEY_SECRET;
  const previousKey = process.env.RAZORPAY_KEY_ID;

  afterEach(() => {
    process.env.RAZORPAY_KEY_SECRET = previousSecret;
    process.env.RAZORPAY_KEY_ID = previousKey;
  });

  it('creates a mock Razorpay order when keys are not configured', async () => {
    delete process.env.RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;

    const service = new PaymentsService();
    const order = await service.createRazorpayOrder({ amount: 123, currency: 'INR' });

    expect(order).toMatchObject({
      mode: 'mock',
      amount: 12300,
      currency: 'INR',
    });
    expect(order.orderId).toContain('order_mock_');
  });

  it('verifies mock payment payloads only in mock mode', () => {
    delete process.env.RAZORPAY_KEY_SECRET;

    const service = new PaymentsService();
    const result = service.verifyRazorpayPayment({
      razorpayOrderId: 'order_mock_123',
      razorpayPaymentId: 'pay_mock_123',
      razorpaySignature: 'mock_signature',
    });

    expect(result).toMatchObject({
      mode: 'mock',
      verified: true,
    });
  });
});
