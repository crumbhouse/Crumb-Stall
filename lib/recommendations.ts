import type { FoodItem } from "@/lib/catalog";

export type RecommendedFoodItem = FoodItem & {
  recommendationReason: string;
};

export type FoodRecommendationsResponse = {
  data: RecommendedFoodItem[];
  meta: {
    limit: number;
    personalized: boolean;
  };
};

export async function getFoodRecommendations(limit = 8) {
  const params = new URLSearchParams({
    limit: String(limit),
  });

  try {
    const response = await fetch(`${getAppUrl()}/api/recommendations/foods?${params.toString()}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return emptyRecommendations(limit);
    }

    return (await response.json()) as FoodRecommendationsResponse;
  } catch {
    return emptyRecommendations(limit);
  }
}

function emptyRecommendations(limit: number): FoodRecommendationsResponse {
  return {
    data: [],
    meta: {
      limit,
      personalized: false,
    },
  };
}

function getAppUrl() {
  return process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}
