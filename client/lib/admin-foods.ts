import type { FoodItem } from "@/lib/catalog";

export type AdminFoodItem = FoodItem;

export type FoodItemInput = {
  categoryId: string;
  name: string;
  slug?: string;
  description: string;
  ingredients?: string[];
  price: number;
  discountPrice?: number | null;
  imageUrl?: string;
  tags?: string[];
  type?: "VEG" | "NON_VEG";
  popularity?: number;
  isAvailable?: boolean;
  isFeatured?: boolean;
};

export async function createAdminFood(input: FoodItemInput) {
  const response = await fetch("/api/admin/foods", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Food item creation failed"));
  }

  return (await response.json()) as AdminFoodItem;
}

export async function updateAdminFood(foodItemId: string, input: FoodItemInput) {
  const response = await fetch(`/api/admin/foods/${encodeURIComponent(foodItemId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Food item update failed"));
  }

  return (await response.json()) as AdminFoodItem;
}

export async function deactivateAdminFood(foodItemId: string) {
  const response = await fetch(`/api/admin/foods/${encodeURIComponent(foodItemId)}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Food item deactivation failed"));
  }

  return (await response.json()) as AdminFoodItem;
}

async function readErrorMessage(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as { message?: string };

    return typeof payload.message === "string" ? payload.message : fallback;
  } catch {
    return fallback;
  }
}
