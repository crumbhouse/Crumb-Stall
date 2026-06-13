type CreateRazorpayOrderResponse = {
  mode: "live" | "mock";
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  receipt: string;
};

export type StartCheckoutOrderPayload = {
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
    fee?: number;
  };
  checkoutAttemptId?: string;
};

type CheckoutOrderResponse = {
  id: string;
  orderNumber: string;
  status: string;
  pickupTime?: string;
  subtotalAmount: number;
  taxAmount: number;
  discountAmount: number;
  pickupFeeAmount: number;
  totalAmount: number;
  paymentId?: string;
};

type StartCheckoutOrderResponse = CheckoutOrderResponse & {
  razorpay: CreateRazorpayOrderResponse;
};

export type RecoverCheckoutOrderPayload = {
  orderNumber: string;
  razorpayOrderId: string;
};

export async function startCheckoutOrder(payload: StartCheckoutOrderPayload) {
  const response = await fetch("/api/checkout/start", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(errorPayload?.message ?? "Could not start checkout");
  }

  return (await response.json()) as StartCheckoutOrderResponse;
}

export async function createCashCheckoutOrder(payload: StartCheckoutOrderPayload) {
  const response = await fetch("/api/checkout/cash", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(errorPayload?.message ?? "Could not place cash order");
  }

  return (await response.json()) as CheckoutOrderResponse;
}

export async function confirmCheckoutPayment(payload: {
  orderNumber: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const response = await fetch("/api/checkout/confirm", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(errorPayload?.message ?? "Payment verification failed");
  }

  return (await response.json()) as CheckoutOrderResponse;
}

export async function recoverCheckoutOrder(payload: RecoverCheckoutOrderPayload) {
  const response = await fetch("/api/checkout/recover", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(errorPayload?.message ?? "Could not recover paid order");
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
      prefill?: {
        email?: string;
        contact?: string;
      };
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
