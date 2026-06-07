"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { CustomerNav } from "@/components/customer-nav";
import { MobileBar } from "@/components/mobile-bar";
import { getFoodImageUrl } from "@/lib/catalog";
import { useCart } from "@/lib/cart";

export default function CartPage() {
  const { status } = useSession();
  const {
    items,
    itemCount,
    subtotal,
    discount,
    tax,
    total,
    coupon,
    couponError,
    applyCoupon,
    removeCoupon,
    increaseItem,
    decreaseItem,
    removeItem,
    updateItemNote,
  } = useCart();
  const [couponCode, setCouponCode] = useState(coupon?.code ?? "");

  async function handleApplyCoupon(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await applyCoupon(couponCode);
  }

  const isAuthenticated = status === "authenticated";

  return (
    <main className="min-h-screen bg-[#f6f6f4] pb-24 text-[#171717]">
      <CustomerNav />
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-[#e23744]">Cart</p>
        <h1 className="mt-2 text-3xl font-black">Review your order</h1>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            {!isAuthenticated ? (
              <div className="rounded-lg border border-dashed border-[#d7d7cf] bg-white p-8 text-center">
                <p className="text-2xl font-black">Login to start your cart</p>
                <p className="mt-2 text-sm font-semibold text-[#646464]">
                  We keep every order tied to a real account, so please login before adding food.
                </p>
                <Link
                  href="/login?callbackUrl=/menu"
                  className="mt-6 inline-flex rounded-md bg-[#e23744] px-5 py-3 font-black text-white"
                >
                  Login and order
                </Link>
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[#d7d7cf] bg-white p-8 text-center">
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
              <div className="space-y-3">
                {items.map(({ item, quantity, note }) => {
                  const imageUrl = getFoodImageUrl(item);

                  return (
                    <article
                      key={item.id}
                      className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 rounded-lg border border-[#e8e8e3] bg-white p-3 shadow-sm sm:grid-cols-[104px_minmax(0,1fr)_140px]"
                    >
                      <div className="overflow-hidden rounded-lg bg-[#f1f1ee]">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={item.name}
                            width={160}
                            height={120}
                            unoptimized
                            className="h-24 w-full object-cover sm:h-full"
                          />
                        ) : (
                          <div className="flex h-24 items-center justify-center text-2xl font-black text-[#c9c9c1] sm:h-full">
                            {item.name.slice(0, 2)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-lg font-black leading-6">{item.name}</p>
                        <p className="mt-1 text-sm font-semibold text-[#646464]">
                          {item.category.name} · Rs {item.finalPrice} each
                        </p>
                        <label className="mt-3 block">
                          <span className="text-sm font-black text-[#555]">Special instructions</span>
                          <textarea
                            value={note}
                            onChange={(event) => updateItemNote(item.id, event.target.value)}
                            rows={1}
                            maxLength={120}
                            placeholder="Example: less spicy, no onion, extra chutney"
                            className="mt-2 w-full resize-none rounded-md border border-[#e8e8e3] bg-[#f9f9f7] px-3 py-2 text-sm font-semibold text-[#171717] outline-none placeholder:text-[#9a9a92] focus:border-[#e23744]"
                          />
                        </label>
                      </div>
                      <div className="col-span-2 flex items-center justify-between gap-3 border-t border-[#eeeeea] pt-3 sm:col-span-1 sm:flex-col sm:items-end sm:justify-between sm:border-t-0 sm:pt-0">
                        <div className="flex items-center rounded-md border border-[#e8e8e3] bg-[#f9f9f7]">
                          <button
                            type="button"
                            onClick={() => decreaseItem(item.id)}
                            className="px-3 py-2 text-lg font-black text-[#e23744]"
                            aria-label={`Decrease ${item.name}`}
                          >
                            -
                          </button>
                          <span className="min-w-8 text-center text-sm font-black">{quantity}</span>
                          <button
                            type="button"
                            onClick={() => increaseItem(item.id)}
                            className="px-3 py-2 text-lg font-black text-[#e23744]"
                            aria-label={`Increase ${item.name}`}
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black">Rs {item.finalPrice * quantity}</p>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="mt-1 text-sm font-black text-[#e23744]"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

        <aside className="h-fit rounded-lg border border-[#e8e8e3] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black">Bill summary</h2>
          <form onSubmit={handleApplyCoupon} className="mt-5">
            <label htmlFor="cart-coupon" className="text-sm font-black text-[#555]">
              Coupon code
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="cart-coupon"
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                placeholder="WELCOME10"
                className="min-w-0 flex-1 rounded-md border border-[#e8e8e3] px-3 py-2 text-sm font-bold uppercase outline-none focus:border-[#e23744]"
              />
              <button
                type="submit"
                className="rounded-md bg-[#171717] px-4 py-2 text-sm font-black text-white"
              >
                Apply
              </button>
            </div>
            {coupon ? (
              <div className="mt-3 rounded-md bg-[#ecfdf3] px-3 py-2 text-sm font-bold text-[#166534]">
                <div className="flex items-center justify-between gap-3">
                  <span>{coupon.code} applied</span>
                  <button
                    type="button"
                    onClick={() => {
                      removeCoupon();
                      setCouponCode("");
                    }}
                    className="font-black"
                  >
                    Remove
                  </button>
                </div>
                <p className="mt-1 text-xs font-semibold">{coupon.label}</p>
              </div>
            ) : null}
            {couponError ? (
              <p className="mt-2 rounded-md bg-[#fff0f2] px-3 py-2 text-sm font-bold text-[#b91c2b]">
                {couponError}
              </p>
            ) : null}
          </form>
          <div className="mt-5 space-y-3 text-sm text-[#555]">
            <div className="flex justify-between">
              <span>{itemCount} items</span>
              <span>Rs {subtotal}</span>
            </div>
            {discount > 0 ? (
              <div className="flex justify-between text-[#166534]">
                <span>Discount</span>
                <span>- Rs {discount}</span>
              </div>
            ) : null}
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
        </div>
      </section>
      <MobileBar />
    </main>
  );
}
