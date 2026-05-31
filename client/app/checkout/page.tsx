"use client";

import Link from "next/link";
import { CustomerNav } from "@/components/customer-nav";
import { useCart } from "@/lib/cart";

export default function CheckoutPage() {
  const { items, subtotal, tax, total } = useCart();

  return (
    <main className="min-h-screen bg-[#f6f6f4] text-[#171717]">
      <CustomerNav />
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_360px]">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[#e23744]">
            Checkout
          </p>
          <h1 className="mt-2 text-3xl font-black">Pickup and payment</h1>
          <div className="mt-6 space-y-4">
            <div className="rounded-lg border border-[#e8e8e3] bg-white p-5 shadow-sm">
              <p className="font-black">Pickup time</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {["ASAP", "15 min", "30 min"].map((slot, index) => (
                  <button
                    key={slot}
                    className={`rounded-md border px-4 py-3 text-sm font-black ${
                      index === 0
                        ? "border-[#e23744] bg-[#fff0f2] text-[#b91c2b]"
                        : "border-[#e8e8e3] hover:border-[#e23744] hover:bg-[#fff0f2]"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-[#e8e8e3] bg-white p-5 shadow-sm">
              <p className="font-black">Coupon</p>
              <div className="mt-4 flex gap-3">
                <input
                  className="min-w-0 flex-1 rounded-md border border-[#e8e8e3] px-4 py-3 font-semibold outline-none focus:border-[#e23744]"
                  placeholder="WELCOME10"
                />
                <button className="rounded-md bg-[#171717] px-5 py-3 font-black text-white">
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-lg border border-[#e8e8e3] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black">Order summary</h2>
          {items.length === 0 ? (
            <p className="mt-4 text-sm font-semibold text-[#646464]">Your cart is empty.</p>
          ) : (
            <div className="mt-5 space-y-3">
              {items.map(({ item, quantity, note }) => (
                <div key={item.id} className="text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="font-semibold text-[#555]">
                      {quantity} x {item.name}
                    </span>
                    <span className="font-black">Rs {item.finalPrice * quantity}</span>
                  </div>
                  {note ? (
                    <p className="mt-1 rounded-md bg-[#f9f9f7] px-2 py-1 text-xs font-semibold text-[#646464]">
                      Note: {note}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
          <div className="mt-5 space-y-3 border-t border-[#e8e8e3] pt-4 text-sm text-[#555]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>Rs {subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>Rs {tax}</span>
            </div>
            <div className="flex justify-between text-base font-black text-[#171717]">
              <span>Total</span>
              <span>Rs {total}</span>
            </div>
          </div>
          <Link
            href={items.length > 0 ? "/orders/CS-1001" : "/menu"}
            className="mt-6 flex justify-center rounded-md bg-[#e23744] px-5 py-4 font-black text-white transition hover:bg-[#b91c2b]"
          >
            {items.length > 0 ? "Pay with Razorpay" : "Back to menu"}
          </Link>
        </aside>
      </section>
    </main>
  );
}
