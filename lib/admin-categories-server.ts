import { cookies } from "next/headers";
import type { AdminCategory } from "@/lib/admin-categories";

export async function getAdminCategories() {
  const cookieHeader = (await cookies()).toString();
  const response = await fetch(`${getAppUrl()}/api/admin/categories`, {
    cache: "no-store",
    headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
  });

  if (!response.ok) {
    return [];
  }

  return (await response.json()) as AdminCategory[];
}

function getAppUrl() {
  return process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}
