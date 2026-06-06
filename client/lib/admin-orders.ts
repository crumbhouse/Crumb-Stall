export type AdminOrderSummary = {
  id: string;
  orderNumber: string;
  status: string;
  statusLabel: string;
  placedAt: string;
  pickupTime?: string;
  totalAmount: number;
  itemCount: number;
  itemPreview: string[];
  customer: {
    name: string | null;
    email: string;
  };
};

export type AdminOrdersResponse = {
  data: AdminOrderSummary[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  allowedStatusUpdates: string[];
};

export type AdminOrderDetail = {
  id: string;
  orderNumber: string;
  status: string;
  statusLabel: string;
  placedAt: string;
  pickupTime?: string;
  completedAt?: string;
  cancelledAt?: string;
  subtotalAmount: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  couponCode: string | null;
  timeline: Array<{
    status: string;
    label: string;
    description: string;
    state: "done" | "current" | "pending";
    timestamp: string | null;
  }>;
  customer: {
    name: string | null;
    email: string;
  };
  pickupOtp: {
    code: string;
    expiresAt: string;
    attemptCount: number;
  } | null;
  payment: {
    status: string;
    provider: string;
    paymentId: string | null;
    providerOrderId: string | null;
    amount: number;
    currency: string;
  } | null;
  items: Array<{
    id: string;
    name: string;
    note: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  allowedStatusUpdates: string[];
};

export async function getAdminOrders({
  page = 1,
  status,
  search,
}: {
  page?: number;
  status?: string;
  search?: string;
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: "20",
  });

  if (status) {
    params.set("status", status);
  }

  if (search) {
    params.set("search", search);
  }

  const response = await fetch(`${getAppUrl()}/api/admin/orders?${params.toString()}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      data: [],
      meta: { page, limit: 20, total: 0, totalPages: 0 },
      allowedStatusUpdates: [],
    } satisfies AdminOrdersResponse;
  }

  return (await response.json()) as AdminOrdersResponse;
}

export async function updateAdminOrderStatus(orderNumber: string, status: string) {
  const response = await fetch(
    `/api/admin/orders/${encodeURIComponent(orderNumber)}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    },
  );

  if (!response.ok) {
    throw new Error("Order status update failed");
  }

  return response.json();
}

export async function verifyAdminOrderOtp(orderNumber: string, otp: string) {
  const response = await fetch(
    `/api/admin/orders/${encodeURIComponent(orderNumber)}/otp/verify`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ otp }),
    },
  );

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "OTP verification failed"));
  }

  return response.json();
}

export async function generateAdminOrderOtp(orderNumber: string) {
  const response = await fetch(
    `/api/admin/orders/${encodeURIComponent(orderNumber)}/otp/generate`,
    {
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "OTP generation failed"));
  }

  return response.json();
}

function getAppUrl() {
  return process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}

async function readErrorMessage(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as { message?: string };

    return typeof payload.message === "string" ? payload.message : fallback;
  } catch {
    return fallback;
  }
}
