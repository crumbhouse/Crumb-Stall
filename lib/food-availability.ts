import type { FoodItem } from "@/lib/catalog";

export async function getAvailableFoodItem(slug: string) {
  const response = await fetch(`/api/foods/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("This item is no longer available.");
  }

  const item = (await response.json()) as FoodItem;

  if (!item.isAvailable) {
    throw new Error(`${item.name} is currently unavailable.`);
  }

  return item;
}
