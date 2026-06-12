import { cookies } from "next/headers";
import type { AdminCoupon } from "@/lib/admin-coupons";

export async function getAdminCoupons() {
  const cookieHeader = (await cookies()).toString();
  const response = await fetch(`${getAppUrl()}/api/admin/coupons`, {
    cache: "no-store",
    headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
  });

  if (!response.ok) {
    return [];
  }

  return (await response.json()) as AdminCoupon[];
}

function getAppUrl() {
  return process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}
