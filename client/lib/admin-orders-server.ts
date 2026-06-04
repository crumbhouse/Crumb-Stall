import { cookies } from "next/headers";
import type { AdminOrdersResponse } from "@/lib/admin-orders";

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

function getAppUrl() {
  return process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}
