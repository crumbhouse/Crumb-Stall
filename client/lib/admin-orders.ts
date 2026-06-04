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
    throw new Error("OTP verification failed");
  }

  return response.json();
}

function getAppUrl() {
  return process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}
