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

export async function submitOrderRating({
  orderNumber,
  rating,
}: {
  orderNumber: string;
  rating: number;
}) {
  const response = await fetch(`/api/reviews/orders/${encodeURIComponent(orderNumber)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rating }),
  });

  if (!response.ok) {
    throw new Error("Order rating failed");
  }

  return (await response.json()) as {
    orderNumber: string;
    rating: number;
    reviewedItemCount: number;
  };
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
