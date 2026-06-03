type CreateRazorpayOrderResponse = {
  mode: "live" | "mock";
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  receipt: string;
};

type VerifyRazorpayPaymentPayload = {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
};

type VerifyRazorpayPaymentResponse = {
  mode: "live" | "mock";
  verified: boolean;
  orderId: string;
  paymentId: string;
};

type CheckoutOrderPayload = {
  items: Array<{
    foodItemId: string;
    slug: string;
    quantity: number;
    note?: string;
  }>;
  couponCode?: string;
  pickupSlot: {
    id: string;
    label: string;
    minutesFromNow: number;
  };
  payment: VerifyRazorpayPaymentPayload;
};

type CheckoutOrderResponse = {
  id: string;
  orderNumber: string;
  status: string;
  pickupTime?: string;
  subtotalAmount: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentId?: string;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export async function createRazorpayOrder(amount: number) {
  const response = await fetch(`${apiUrl}/payments/razorpay/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount,
      currency: "INR",
      receipt: `CS-${Date.now()}`,
      notes: {
        source: "crumbstall-web",
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Could not create Razorpay order");
  }

  return (await response.json()) as CreateRazorpayOrderResponse;
}

export async function verifyRazorpayPayment(payload: VerifyRazorpayPaymentPayload) {
  const response = await fetch(`${apiUrl}/payments/razorpay/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Payment verification failed");
  }

  return (await response.json()) as VerifyRazorpayPaymentResponse;
}

export async function createCheckoutOrder(payload: CheckoutOrderPayload) {
  const response = await fetch(`${apiUrl}/orders/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Could not create order after payment");
  }

  return (await response.json()) as CheckoutOrderResponse;
}

export function loadRazorpayCheckout() {
  return new Promise<boolean>((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

declare global {
  interface Window {
    Razorpay?: new (options: {
      key: string;
      amount: number;
      currency: string;
      name: string;
      description: string;
      order_id: string;
      handler: (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => void;
      modal?: {
        ondismiss?: () => void;
      };
      theme?: {
        color?: string;
      };
    }) => {
      open: () => void;
    };
  }
}
