import type { FoodItem } from "@/lib/catalog";

export type FavoritesResponse = {
  data: FoodItem[];
};

export type FavoriteIdsResponse = {
  foodItemIds: string[];
  slugs: string[];
};

export async function getFavorites(): Promise<FavoritesResponse> {
  return fetchJson<FavoritesResponse>("/favorites", { data: [] });
}

export async function getFavoriteIds(): Promise<FavoriteIdsResponse> {
  return fetchJson<FavoriteIdsResponse>("/favorites/ids", { foodItemIds: [], slugs: [] });
}

export async function addFavorite(slug: string) {
  return mutateFavorite(slug, "POST");
}

export async function removeFavorite(slug: string) {
  return mutateFavorite(slug, "DELETE");
}

async function mutateFavorite(slug: string, method: "POST" | "DELETE") {
  const response = await fetch(`/api/favorites/${encodeURIComponent(slug)}`, {
    method,
  });

  if (!response.ok) {
    throw new Error("Favorite update failed");
  }

  return (await response.json()) as { isFavorite: boolean; slug?: string; item?: FoodItem };
}

async function fetchJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${getAppUrl()}/api${path}`, {
      cache: "no-store",
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
