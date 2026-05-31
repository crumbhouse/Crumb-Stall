"use client";

import type { FoodItem } from "@/lib/catalog";
import { useCart } from "@/lib/cart";

export function AddToCartButton({
  item,
  className,
  children = "Add",
}: {
  item: FoodItem;
  className?: string;
  children?: React.ReactNode;
}) {
  const { addItem, getQuantity } = useCart();
  const quantity = getQuantity(item.id);

  return (
    <button
      type="button"
      onClick={() => addItem(item)}
      className={
        className ??
        "rounded-md bg-[#e23744] px-4 py-2 text-sm font-black text-white transition hover:bg-[#b91c2b]"
      }
    >
      {quantity > 0 ? `${quantity} in cart` : children}
    </button>
  );
}
