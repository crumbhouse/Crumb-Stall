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

export const fallbackCategories: Category[] = [
  {
    id: "snacks",
    name: "Snacks",
    slug: "snacks",
    description: "Fast bites for between classes.",
    imageUrl: null,
    sortOrder: 1,
    foodItemCount: 2,
  },
  {
    id: "beverages",
    name: "Beverages",
    slug: "beverages",
    description: "Coffee, tea, shakes, and refreshers.",
    imageUrl: null,
    sortOrder: 2,
    foodItemCount: 1,
  },
  {
    id: "combos",
    name: "Combos",
    slug: "combos",
    description: "Student-friendly meal bundles.",
    imageUrl: null,
    sortOrder: 3,
    foodItemCount: 1,
  },
];

export const fallbackFoods: FoodItem[] = [
  {
    id: "classic-veg-burger",
    name: "Classic Veg Burger",
    slug: "classic-veg-burger",
    description: "Crispy patty, fresh veggies, and house sauce in a toasted bun.",
    price: 89,
    discountPrice: 79,
    finalPrice: 79,
    imageUrl:
      "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=900&q=80",
    tags: ["burger", "quick-bite", "popular"],
    type: "VEG",
    ratingAverage: 4.6,
    ratingCount: 128,
    popularity: 95,
    isAvailable: true,
    isFeatured: true,
    category: { id: "snacks", name: "Snacks", slug: "snacks" },
  },
  {
    id: "steamed-momos",
    name: "Steamed Momos",
    slug: "steamed-momos",
    description: "Soft steamed momos served with spicy chutney.",
    price: 69,
    discountPrice: null,
    finalPrice: 69,
    imageUrl:
      "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=900&q=80",
    tags: ["momos", "student-favorite"],
    type: "VEG",
    ratingAverage: 4.5,
    ratingCount: 96,
    popularity: 90,
    isAvailable: true,
    isFeatured: true,
    category: { id: "snacks", name: "Snacks", slug: "snacks" },
  },
  {
    id: "cold-coffee",
    name: "Cold Coffee",
    slug: "cold-coffee",
    description: "Chilled coffee blended smooth for a quick recharge.",
    price: 79,
    discountPrice: null,
    finalPrice: 79,
    imageUrl:
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80",
    tags: ["coffee", "beverage"],
    type: "VEG",
    ratingAverage: 4.4,
    ratingCount: 83,
    popularity: 82,
    isAvailable: true,
    isFeatured: false,
    category: { id: "beverages", name: "Beverages", slug: "beverages" },
  },
  {
    id: "burger-coffee-combo",
    name: "Burger + Coffee Combo",
    slug: "burger-coffee-combo",
    description: "A filling burger with cold coffee at a student-friendly price.",
    price: 159,
    discountPrice: 139,
    finalPrice: 139,
    imageUrl:
      "https://images.unsplash.com/photo-1619096252214-ef06c45683e3?auto=format&fit=crop&w=900&q=80",
    tags: ["combo", "value"],
    type: "VEG",
    ratingAverage: 4.7,
    ratingCount: 74,
    popularity: 88,
    isAvailable: true,
    isFeatured: true,
    category: { id: "combos", name: "Combos", slug: "combos" },
  },
];

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export async function getCatalogPreview() {
  const [categories, featured] = await Promise.all([
    fetchJson<Category[]>("/categories", fallbackCategories),
    fetchJson<FoodItem[]>("/foods/featured", fallbackFoods.filter((item) => item.isFeatured)),
  ]);

  return { categories, featured };
}

export async function getMenuCatalog() {
  const [categories, foodsResponse] = await Promise.all([
    fetchJson<Category[]>("/categories", fallbackCategories),
    fetchJson<{ data: FoodItem[] }>("/foods?limit=50&available=true", { data: fallbackFoods }),
  ]);

  return { categories, foods: foodsResponse.data };
}

export async function getFoodBySlug(slug: string) {
  return fetchJson<FoodItem | null>(
    `/foods/${slug}`,
    fallbackFoods.find((item) => item.slug === slug) ?? null,
  );
}

async function fetchJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${apiUrl}${path}`, {
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      return fallback;
    }

    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}
