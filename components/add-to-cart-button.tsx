"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import type { FoodItem } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { getAvailableFoodItem } from "@/lib/food-availability";
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
  const [message, setMessage] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const isAuthenticated = status === "authenticated";
  const quantity = getQuantity(item.id);
  const isFullWidthButton = className?.includes("w-full") ?? false;
  const controlWrapperClass = isFullWidthButton
    ? "w-full"
    : "flex max-w-44 flex-col items-end";
  const messageClass = isFullWidthButton
    ? "mt-2 rounded-md bg-[#fff0f2] px-3 py-2 text-xs font-bold text-[#b91c2b]"
    : "mt-2 max-w-44 rounded-md bg-[#fff0f2] px-2 py-1.5 text-right text-xs font-bold leading-4 text-[#b91c2b]";

  async function withAvailabilityCheck(action: (availableItem: FoodItem) => void) {
    setMessage("");
    setIsChecking(true);

    try {
      const availableItem = await getAvailableFoodItem(item.slug);
      action(availableItem);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "This item is no longer available.");
    } finally {
      setIsChecking(false);
    }
  }

  if (isAuthenticated && quantity > 0) {
    return (
      <div className={controlWrapperClass}>
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
            onClick={() => void withAvailabilityCheck(() => increaseItem(item.id))}
            disabled={isChecking}
            className="px-3 py-2 text-base font-black text-[#d21f32] disabled:opacity-50"
            aria-label={`Increase ${item.name}`}
          >
            +
          </button>
        </div>
        {message ? <p className={messageClass}>{message}</p> : null}
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
    <div className={controlWrapperClass}>
      <button
        type="button"
        onClick={() => void withAvailabilityCheck((availableItem) => addItem(availableItem))}
        disabled={isChecking}
        className={
          className ??
          "rounded-md bg-[#d21f32] px-4 py-2 text-sm font-black text-white transition hover:bg-[#b91c2b] disabled:bg-[#9a9a92]"
        }
      >
        {isChecking ? "Checking..." : children}
      </button>
      {message ? <p className={messageClass}>{message}</p> : null}
    </div>
  );
}
