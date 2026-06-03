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
  const { addItem, decreaseItem, increaseItem, getQuantity } = useCart();
  const quantity = getQuantity(item.id);

  if (quantity > 0) {
    return (
      <div className="inline-flex items-center rounded-md border border-[#e8e8e3] bg-white shadow-sm">
        <button
          type="button"
          onClick={() => decreaseItem(item.id)}
          className="px-3 py-2 text-base font-black text-[#e23744]"
          aria-label={`Decrease ${item.name}`}
        >
          -
        </button>
        <span className="min-w-9 px-1 text-center text-sm font-black text-[#171717]">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => increaseItem(item.id)}
          className="px-3 py-2 text-base font-black text-[#e23744]"
          aria-label={`Increase ${item.name}`}
        >
          +
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => addItem(item)}
      className={
        className ??
        "rounded-md bg-[#e23744] px-4 py-2 text-sm font-black text-white transition hover:bg-[#b91c2b]"
      }
    >
      {children}
    </button>
  );
}
