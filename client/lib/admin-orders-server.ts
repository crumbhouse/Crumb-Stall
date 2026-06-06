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

  return (await response.json()) as AdminOrdersResponse;
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
    order: (await response.json()) as AdminOrderDetail,
    error: null,
  };
}

function getAppUrl() {
  return process.env.NEXTAUTH_URL ?? "http://localhost:3000";
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
