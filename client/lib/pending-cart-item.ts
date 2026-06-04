import type { FoodItem } from "@/lib/catalog";

const PENDING_CART_ITEM_KEY = "crumbstall-pending-cart-item";

export function savePendingCartItem(item: FoodItem) {
  try {
    window.sessionStorage.setItem(PENDING_CART_ITEM_KEY, JSON.stringify(item));
  } catch {
    // Login should still proceed even if browser storage is unavailable.
  }
}

export function consumePendingCartItem() {
  let savedItem: string | null = null;

  try {
    savedItem = window.sessionStorage.getItem(PENDING_CART_ITEM_KEY);
  } catch {
    return null;
  }

  if (!savedItem) {
    return null;
  }

  window.sessionStorage.removeItem(PENDING_CART_ITEM_KEY);

  try {
    return JSON.parse(savedItem) as FoodItem;
  } catch {
    return null;
  }
}
