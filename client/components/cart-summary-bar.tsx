"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

export function CartSummaryBar() {
  const { itemCount, total } = useCart();

  if (itemCount === 0) {
    return null;
  }

  return (
    <Link
      href="/cart"
      className="fixed inset-x-4 bottom-20 z-40 flex items-center justify-between rounded-lg bg-[#171717] px-4 py-3 text-white shadow-[0_16px_40px_rgba(20,20,20,0.28)] md:bottom-6 md:left-auto md:right-6 md:w-[360px]"
    >
      <span>
        <span className="block text-sm font-black">
          {itemCount} {itemCount === 1 ? "item" : "items"} added
        </span>
        <span className="text-xs font-semibold text-white/65">Review before checkout</span>
      </span>
      <span className="rounded-md bg-[#d21f32] px-3 py-2 text-sm font-black">Rs {total}</span>
    </Link>
  );
}
