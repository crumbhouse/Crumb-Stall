import { cookies } from "next/headers";
import type { FavoriteIdsResponse, FavoritesResponse } from "@/lib/favorites";

export async function getServerFavorites(): Promise<FavoritesResponse> {
  return fetchJson<FavoritesResponse>("/favorites", { data: [] });
}

export async function getServerFavoriteIds(): Promise<FavoriteIdsResponse> {
  return fetchJson<FavoriteIdsResponse>("/favorites/ids", { foodItemIds: [], slugs: [] });
}

async function fetchJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const cookieHeader = (await cookies()).toString();
    const response = await fetch(`${getAppUrl()}/api${path}`, {
      cache: "no-store",
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });

    if (!response.ok) {
      return fallback;
    }

    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

function getAppUrl() {
  return process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}
