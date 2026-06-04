import { cookies } from "next/headers";

export type AdminAnalyticsSummary = {
  data: {
    revenueToday: number;
    ordersToday: number;
    averageOrderValueToday: number;
    activeCustomersToday: number;
    liveQueueCount: number;
    completedOrdersToday: number;
    cancelledOrdersToday: number;
  };
  meta: {
    startsAt: string;
    endsAt: string;
  };
};

export type RevenueTrendPoint = {
  date: string;
  revenue: number;
  orders: number;
};

export type TopFood = {
  foodItemId: string;
  name: string;
  quantitySold: number;
  revenue: number;
};

export type LiveQueueOrder = {
  id: string;
  orderNumber: string;
  status: string;
  statusLabel: string;
  placedAt: string | null;
  pickupTime: string | null;
  totalAmount: number;
  customer: {
    name: string | null;
    email: string;
  };
  itemPreview: string[];
};

export async function getAdminAnalyticsSummary() {
  return fetchAdminAnalytics<AdminAnalyticsSummary>("summary");
}

export async function getRevenueTrend(days = 7) {
  return fetchAdminAnalytics<{ data: RevenueTrendPoint[] }>(`revenue-trend?days=${days}`);
}

export async function getTopFoods({ days = 30, limit = 5 } = {}) {
  return fetchAdminAnalytics<{ data: TopFood[] }>(`top-foods?days=${days}&limit=${limit}`);
}

export async function getLiveQueue(limit = 8) {
  return fetchAdminAnalytics<{ data: LiveQueueOrder[] }>(`live-queue?limit=${limit}`);
}

async function fetchAdminAnalytics<T>(path: string): Promise<T | null> {
  try {
    const cookieHeader = (await cookies()).toString();
    const response = await fetch(`${getAppUrl()}/api/admin/analytics/${path}`, {
      cache: "no-store",
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function getAppUrl() {
  return process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}
