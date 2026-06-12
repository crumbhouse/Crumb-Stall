export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  foodItemCount: number;
};

export type FoodItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  ingredients: string[];
  price: number;
  discountPrice: number | null;
  finalPrice: number;
  imageUrl: string | null;
  tags: string[];
  type: "VEG" | "NON_VEG";
  ratingAverage: number;
  ratingCount: number;
  popularity: number;
  isAvailable: boolean;
  isFeatured: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  };
};

export function getFoodImageUrl(item: Pick<FoodItem, "slug" | "imageUrl">) {
  return item.imageUrl;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export async function getMenuCatalog() {
  try {
    const [categories, foodsResponse] = await Promise.all([
      fetchJson<Category[]>("/categories"),
      fetchJson<{ data: FoodItem[] }>("/foods?limit=50&available=true"),
    ]);

    return { categories, foods: foodsResponse.data, isUnavailable: false };
  } catch {
    return { categories: [], foods: [], isUnavailable: true };
  }
}

export async function getFoodBySlug(slug: string) {
  try {
    return await fetchJson<FoodItem | null>(`/foods/${slug}`);
  } catch {
    return null;
  }
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    throw new Error(`Catalog request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}
