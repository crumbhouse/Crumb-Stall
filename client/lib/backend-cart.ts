import type { FoodItem } from "@/lib/catalog";

export type BackendCartItem = {
  item: FoodItem;
  quantity: number;
  note: string;
};

export type BackendCartResponse = {
  items: BackendCartItem[];
  updatedAt: string;
};

export async function getBackendCart() {
  const response = await fetch("/api/cart");

  if (!response.ok) {
    throw new Error("Cart sync failed");
  }

  return (await response.json()) as BackendCartResponse;
}

export async function replaceBackendCart(items: BackendCartItem[]) {
  const response = await fetch("/api/cart", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: items.map((cartItem) => ({
        foodItemId: cartItem.item.id,
        quantity: cartItem.quantity,
        note: cartItem.note,
      })),
    }),
  });

  if (!response.ok) {
    throw new Error("Cart sync failed");
  }

  return (await response.json()) as BackendCartResponse;
}

export async function clearBackendCart() {
  const response = await fetch("/api/cart", {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Cart sync failed");
  }

  return (await response.json()) as BackendCartResponse;
}
