"use client";

import Link from "next/link";
import Image from "next/image";
import { CustomerNav } from "@/components/customer-nav";
import { MobileBar } from "@/components/mobile-bar";
import { useCart } from "@/lib/cart";

export default function CartPage() {
  const {
    items,
    itemCount,
    subtotal,
    tax,
    total,
    increaseItem,
    decreaseItem,
    removeItem,
    updateItemNote,
  } = useCart();

  return (
    <main className="min-h-screen bg-[#f6f6f4] pb-24 text-[#171717]">
      <CustomerNav />
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[#e23744]">Cart</p>
          <h1 className="mt-2 text-3xl font-black">Review your order</h1>

          {items.length === 0 ? (
            <div className="mt-6 rounded-lg border border-dashed border-[#d7d7cf] bg-white p-8 text-center">
              <p className="text-2xl font-black">Your cart is empty</p>
              <p className="mt-2 text-sm font-semibold text-[#646464]">
                Add snacks, coffee, or combos from the menu before checkout.
              </p>
              <Link
                href="/menu"
                className="mt-6 inline-flex rounded-md bg-[#e23744] px-5 py-3 font-black text-white"
              >
                Browse menu
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {items.map(({ item, quantity, note }) => (
                <article
                  key={item.id}
                  className="grid gap-4 rounded-lg border border-[#e8e8e3] bg-white p-4 shadow-sm sm:grid-cols-[96px_1fr]"
                >
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={96}
                      height={96}
                      className="size-24 rounded-lg object-cover"
                    />
                  ) : null}
                  <div className="min-w-0">
                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                      <div>
                        <p className="font-black">{item.name}</p>
                        <p className="mt-1 text-sm font-semibold text-[#646464]">
                          {item.category.name} · Rs {item.finalPrice}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="mt-3 text-sm font-black text-[#e23744]"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                        <div className="flex items-center rounded-md border border-[#e8e8e3] bg-[#f9f9f7]">
                          <button
                            type="button"
                            onClick={() => decreaseItem(item.id)}
                            className="px-3 py-2 text-lg font-black"
                            aria-label={`Decrease ${item.name}`}
                          >
                            -
                          </button>
                          <span className="min-w-8 text-center text-sm font-black">{quantity}</span>
                          <button
                            type="button"
                            onClick={() => increaseItem(item.id)}
                            className="px-3 py-2 text-lg font-black"
                            aria-label={`Increase ${item.name}`}
                          >
                            +
                          </button>
                        </div>
                        <p className="font-black">Rs {item.finalPrice * quantity}</p>
                      </div>
                    </div>
                    <label className="mt-4 block">
                      <span className="text-sm font-black text-[#555]">Special instructions</span>
                      <textarea
                        value={note}
                        onChange={(event) => updateItemNote(item.id, event.target.value)}
                        rows={2}
                        maxLength={120}
                        placeholder="Example: less spicy, no onion, extra chutney"
                        className="mt-2 w-full resize-none rounded-md border border-[#e8e8e3] bg-[#f9f9f7] px-3 py-2 text-sm font-semibold text-[#171717] outline-none placeholder:text-[#9a9a92] focus:border-[#e23744]"
                      />
                      <span className="mt-1 block text-xs font-semibold text-[#8b8b8b]">
                        {note.length}/120 characters
                      </span>
                    </label>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="h-fit rounded-lg border border-[#e8e8e3] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black">Bill summary</h2>
          <div className="mt-5 space-y-3 text-sm text-[#555]">
            <div className="flex justify-between">
              <span>{itemCount} items</span>
              <span>Rs {subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>Rs {tax}</span>
            </div>
            <div className="flex justify-between border-t border-[#e8e8e3] pt-3 text-base font-black text-[#171717]">
              <span>Total</span>
              <span>Rs {total}</span>
            </div>
          </div>
          <Link
            href={items.length > 0 ? "/checkout" : "/menu"}
            className="mt-6 flex justify-center rounded-md bg-[#e23744] px-5 py-3 font-black text-white transition hover:bg-[#b91c2b]"
          >
            {items.length > 0 ? "Proceed to checkout" : "Browse menu"}
          </Link>
        </aside>
      </section>
      <MobileBar />
    </main>
  );
}
