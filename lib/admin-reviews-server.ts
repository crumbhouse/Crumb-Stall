import { cookies } from "next/headers";
import type { AdminReview } from "@/lib/admin-reviews";

export async function getAdminReviews() {
  const cookieHeader = (await cookies()).toString();
  const response = await fetch(`${getAppUrl()}/api/admin/reviews`, {
    cache: "no-store",
    headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
  });

  if (!response.ok) {
    return [];
  }

  return (await response.json()) as AdminReview[];
}

function getAppUrl() {
  return process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}
