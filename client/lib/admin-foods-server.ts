import { cookies } from "next/headers";
import type { AdminFoodItem } from "@/lib/admin-foods";

export async function getAdminFoods() {
  const cookieHeader = (await cookies()).toString();
  const response = await fetch(`${getAppUrl()}/api/admin/foods`, {
    cache: "no-store",
    headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
  });

  if (!response.ok) {
    return [];
  }

  return (await response.json()) as AdminFoodItem[];
}

function getAppUrl() {
  return process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}
