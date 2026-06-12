export type AdminReview = {
  id: string;
  rating: number;
  comment: string | null;
  imageUrls: string[];
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    email: string;
    imageUrl: string | null;
  };
  foodItem: {
    id: string;
    name: string;
    slug: string;
  };
};

export async function moderateAdminReview(reviewId: string, isHidden: boolean) {
  const response = await fetch(`/api/admin/reviews/${encodeURIComponent(reviewId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isHidden }),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Review moderation failed"));
  }

  return (await response.json()) as AdminReview;
}

async function readErrorMessage(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as { message?: string };

    return typeof payload.message === "string" ? payload.message : fallback;
  } catch {
    return fallback;
  }
}
