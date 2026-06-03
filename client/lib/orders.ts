export type OrderTimelineStep = {
  status: string;
  label: string;
  description: string;
  state: "done" | "current" | "pending";
  timestamp: string | null;
};

export type OrderDetail = {
  id: string;
  orderNumber: string;
  status: string;
  statusLabel: string;
  timeline: OrderTimelineStep[];
  pickupTime?: string;
  placedAt?: string;
  completedAt?: string;
  subtotalAmount: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  couponCode: string | null;
  pickupOtp: {
    code: string;
    expiresAt: string;
    attemptCount: number;
  } | null;
  payment: {
    status: string;
    provider: string;
    paymentId: string | null;
    amount: number;
  } | null;
  items: Array<{
    id: string;
    name: string;
    note: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
};

export type OrderSummary = {
  id: string;
  orderNumber: string;
  status: string;
  statusLabel: string;
  placedAt: string;
  pickupTime?: string;
  totalAmount: number;
  itemCount: number;
  itemPreview: string[];
};

export type OrderHistoryResponse = {
  data: OrderSummary[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export async function getRecentOrders({
  page = 1,
  status,
  search,
}: {
  page?: number;
  status?: string;
  search?: string;
} = {}): Promise<OrderHistoryResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: "10",
  });

  if (status) {
    params.set("status", status);
  }

  if (search) {
    params.set("search", search);
  }

  try {
    const response = await fetch(`${getAppUrl()}/api/orders?${params.toString()}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return emptyOrderHistory(page);
    }

    return normalizeOrderHistory(await response.json(), page);
  } catch {
    return emptyOrderHistory(page);
  }
}

function normalizeOrderHistory(payload: unknown, page: number): OrderHistoryResponse {
  if (!payload || typeof payload !== "object") {
    return emptyOrderHistory(page);
  }

  const candidate = payload as Partial<OrderHistoryResponse>;

  if (!Array.isArray(candidate.data) || !candidate.meta || typeof candidate.meta !== "object") {
    return emptyOrderHistory(page);
  }

  return {
    data: candidate.data,
    meta: {
      page: Number(candidate.meta.page) || page,
      limit: Number(candidate.meta.limit) || 10,
      total: Number(candidate.meta.total) || 0,
      totalPages: Number(candidate.meta.totalPages) || 0,
    },
  };
}

function emptyOrderHistory(page: number): OrderHistoryResponse {
  return {
    data: [],
    meta: {
      page,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
  };
}

export async function getOrderDetail(orderNumber: string): Promise<OrderDetail | null> {
  try {
    const response = await fetch(`${getAppUrl()}/api/orders/${encodeURIComponent(orderNumber)}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as OrderDetail;
  } catch {
    return null;
  }
}

function getAppUrl() {
  return process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}
