import { cookies } from "next/headers";
import type { AdminOrderDetail, AdminOrdersResponse } from "@/lib/admin-orders";

export type AdminOrderLookupResult =
  | {
      order: AdminOrderDetail;
      error: null;
    }
  | {
      order: null;
      error: {
        status: number;
        message: string;
      };
    };

export async function getAdminOrders({
  page = 1,
  status,
  search,
  dateFrom,
  dateTo,
  minTotal,
  maxTotal,
  paymentStatus,
  paymentProvider,
}: {
  page?: number;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  minTotal?: string;
  maxTotal?: string;
  paymentStatus?: string;
  paymentProvider?: string;
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

  if (dateFrom) {
    params.set("dateFrom", dateFrom);
  }

  if (dateTo) {
    params.set("dateTo", dateTo);
  }

  if (minTotal) {
    params.set("minTotal", minTotal);
  }

  if (maxTotal) {
    params.set("maxTotal", maxTotal);
  }

  if (paymentStatus) {
    params.set("paymentStatus", paymentStatus);
  }

  if (paymentProvider) {
    params.set("paymentProvider", paymentProvider);
  }

  const cookieHeader = (await cookies()).toString();
  const response = await fetch(`${getAppUrl()}/api/admin/orders?${params.toString()}`, {
    cache: "no-store",
    headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
  });

  if (!response.ok) {
    return {
      data: [],
      meta: { page, limit: 20, total: 0, totalPages: 0 },
      allowedStatusUpdates: [],
    } satisfies AdminOrdersResponse;
  }

  return normalizeAdminOrdersResponse(await response.json(), page);
}

export async function getAdminOrder(orderNumber: string): Promise<AdminOrderLookupResult> {
  const cookieHeader = (await cookies()).toString();
  const response = await fetch(
    `${getAppUrl()}/api/admin/orders/${encodeURIComponent(orderNumber)}`,
    {
      cache: "no-store",
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    },
  );

  if (!response.ok) {
    return {
      order: null,
      error: {
        status: response.status,
        message: await readErrorMessage(response),
      },
    };
  }

  return {
    order: normalizeAdminOrderDetail(await response.json()),
    error: null,
  };
}

function getAppUrl() {
  return process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}

function normalizeAdminOrdersResponse(payload: unknown, page: number): AdminOrdersResponse {
  const candidate = payload as Partial<AdminOrdersResponse>;

  return {
    data: Array.isArray(candidate.data)
      ? candidate.data.map((order) => ({
          ...order,
          allowedStatusUpdates: Array.isArray(order.allowedStatusUpdates)
            ? order.allowedStatusUpdates
            : [],
        }))
      : [],
    meta: {
      page: Number(candidate.meta?.page) || page,
      limit: Number(candidate.meta?.limit) || 20,
      total: Number(candidate.meta?.total) || 0,
      totalPages: Number(candidate.meta?.totalPages) || 0,
    },
    allowedStatusUpdates: Array.isArray(candidate.allowedStatusUpdates)
      ? candidate.allowedStatusUpdates
      : [],
  };
}

function normalizeAdminOrderDetail(payload: unknown): AdminOrderDetail {
  const order = payload as AdminOrderDetail;

  return {
    ...order,
    allowedStatusUpdates: Array.isArray(order.allowedStatusUpdates)
      ? order.allowedStatusUpdates
      : [],
  };
}

async function readErrorMessage(response: Response) {
  const fallback =
    response.status === 404
      ? "This order is not available in the admin order system."
      : "The admin order system could not load this order.";

  try {
    const payload = (await response.json()) as { message?: string };

    return typeof payload.message === "string" ? payload.message : fallback;
  } catch {
    return fallback;
  }
}
