export type Review = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    name: string;
    imageUrl: string | null;
  };
};

export type FoodReviews = {
  summary: {
    ratingAverage: number;
    ratingCount: number;
  };
  canReview: boolean;
  myReview: Review | null;
  data: Review[];
};

export async function getFoodReviews(slug: string): Promise<FoodReviews> {
  return fetchJson<FoodReviews>(`/reviews/foods/${encodeURIComponent(slug)}`, emptyReviews());
}

export async function submitFoodReview({
  slug,
  rating,
  comment,
}: {
  slug: string;
  rating: number;
  comment: string;
}) {
  const response = await fetch(`/api/reviews/foods/${encodeURIComponent(slug)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rating, comment }),
  });

  if (!response.ok) {
    throw new Error("Review submission failed");
  }

  return (await response.json()) as FoodReviews;
}

function emptyReviews(): FoodReviews {
  return {
    summary: {
      ratingAverage: 0,
      ratingCount: 0,
    },
    canReview: false,
    myReview: null,
    data: [],
  };
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
