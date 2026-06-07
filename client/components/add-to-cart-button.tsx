"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import type { FoodItem } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { savePendingCartItem } from "@/lib/pending-cart-item";

export function AddToCartButton({
  item,
  className,
  children = "Add",
}: {
  item: FoodItem;
  className?: string;
  children?: React.ReactNode;
}) {
  const { status } = useSession();
  const { addItem, decreaseItem, increaseItem, getQuantity } = useCart();
  const isAuthenticated = status === "authenticated";
  const quantity = getQuantity(item.id);

  if (isAuthenticated && quantity > 0) {
    return (
      <div className="inline-flex items-center rounded-md border border-[#e8e8e3] bg-white shadow-sm">
        <button
          type="button"
          onClick={() => decreaseItem(item.id)}
          className="px-3 py-2 text-base font-black text-[#d21f32]"
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
          className="px-3 py-2 text-base font-black text-[#d21f32]"
          aria-label={`Increase ${item.name}`}
        >
          +
        </button>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Link
        href="/login?callbackUrl=/menu"
        onClick={() => savePendingCartItem(item)}
        className={
          className ??
          "rounded-md bg-[#d21f32] px-4 py-2 text-sm font-black text-white transition hover:bg-[#b91c2b]"
        }
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => addItem(item)}
      className={
        className ??
        "rounded-md bg-[#d21f32] px-4 py-2 text-sm font-black text-white transition hover:bg-[#b91c2b]"
      }
    >
      {children}
    </button>
  );
}
