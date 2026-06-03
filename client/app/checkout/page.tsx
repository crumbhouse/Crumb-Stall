"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CustomerNav } from "@/components/customer-nav";
import { PICKUP_SLOTS, useCart } from "@/lib/cart";
import { createCheckoutOrder, createRazorpayOrder, loadRazorpayCheckout } from "@/lib/payments";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const {
    items,
    subtotal,
    discount,
    tax,
    total,
    coupon,
    couponError,
    pickupSlot,
    applyCoupon,
    removeCoupon,
    setPickupSlot,
    clearCart,
  } = useCart();
  const [couponCode, setCouponCode] = useState(coupon?.code ?? "");
  const [pickupError, setPickupError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const isLoggedIn = status === "authenticated" && Boolean(session?.user?.email);
  const canPay = items.length > 0 && Boolean(pickupSlot) && isLoggedIn;

  async function handleApplyCoupon(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await applyCoupon(couponCode);
  }

  async function handlePaymentClick() {
    if (items.length === 0) {
      router.push("/menu");
      return;
    }

    if (!isLoggedIn) {
      router.push("/login?callbackUrl=/checkout");
      return;
    }

    if (!pickupSlot) {
      setPickupError("Choose a pickup time before payment.");
      return;
    }

    setIsPaying(true);
    setPaymentError(null);

    try {
      const order = await createRazorpayOrder(total);

      if (order.mode === "mock") {
        const createdOrder = await createCheckoutOrder({
          items: items.map(({ item, quantity, note }) => ({
            foodItemId: item.id,
            slug: item.slug,
            quantity,
            note,
          })),
          couponCode: coupon?.code,
          pickupSlot,
          payment: {
            razorpayOrderId: order.orderId,
            razorpayPaymentId: `pay_mock_${Date.now()}`,
            razorpaySignature: "mock_signature",
          },
        });
        clearCart();
        router.push(`/orders/${createdOrder.orderNumber}`);
        return;
      }

      const isLoaded = await loadRazorpayCheckout();

      if (!isLoaded || !window.Razorpay) {
        throw new Error("Razorpay Checkout could not be loaded.");
      }

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Crumb Stall",
        description: "Food pickup order",
        order_id: order.orderId,
        prefill: {
          email: session?.user?.email ?? undefined,
        },
        handler: async (response) => {
          try {
            const createdOrder = await createCheckoutOrder({
              items: items.map(({ item, quantity, note }) => ({
                foodItemId: item.id,
                slug: item.slug,
                quantity,
                note,
              })),
              couponCode: coupon?.code,
              pickupSlot,
              payment: {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              },
            });
            clearCart();
            router.push(`/orders/${createdOrder.orderNumber}`);
          } catch {
            setPaymentError("Payment verification failed. Please contact the stall counter.");
            setIsPaying(false);
          }
        },
        modal: {
          ondismiss: () => setIsPaying(false),
        },
        theme: {
          color: "#e23744",
        },
      });

      razorpay.open();
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "Payment could not be started.");
      setIsPaying(false);
    }
  }

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
              <p className="mt-1 text-sm font-semibold text-[#646464]">
                We will use this to prepare your order and generate the pickup window.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {PICKUP_SLOTS.map((slot) => {
                  const isSelected = pickupSlot?.id === slot.id;

                  return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => {
                      setPickupSlot(slot);
                      setPickupError(null);
                    }}
                    className={`rounded-md border px-4 py-3 text-sm font-black ${
                      isSelected
                        ? "border-[#e23744] bg-[#fff0f2] text-[#b91c2b]"
                        : "border-[#e8e8e3] hover:border-[#e23744] hover:bg-[#fff0f2]"
                    }`}
                  >
                    <span className="block">{slot.label}</span>
                    <span className="mt-1 block text-xs font-semibold opacity-75">
                      {slot.description}
                    </span>
                  </button>
                  );
                })}
              </div>
              {pickupError ? (
                <p className="mt-3 rounded-md bg-[#fff0f2] px-3 py-2 text-sm font-bold text-[#b91c2b]">
                  {pickupError}
                </p>
              ) : null}
            </div>
            <form
              onSubmit={handleApplyCoupon}
              className="rounded-lg border border-[#e8e8e3] bg-white p-5 shadow-sm"
            >
              <p className="font-black">Coupon</p>
              <div className="mt-4 flex gap-3">
                <input
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                  className="min-w-0 flex-1 rounded-md border border-[#e8e8e3] px-4 py-3 font-semibold outline-none focus:border-[#e23744]"
                  placeholder="WELCOME10"
                />
                <button
                  type="submit"
                  className="rounded-md bg-[#171717] px-5 py-3 font-black text-white"
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
                <p className="mt-3 rounded-md bg-[#fff0f2] px-3 py-2 text-sm font-bold text-[#b91c2b]">
                  {couponError}
                </p>
              ) : null}
            </form>
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
              <span>Pickup</span>
              <span className={pickupSlot ? "font-black text-[#171717]" : "font-bold text-[#b91c2b]"}>
                {pickupSlot ? pickupSlot.label : "Not selected"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>Rs {subtotal}</span>
            </div>
            {discount > 0 ? (
              <div className="flex justify-between text-[#166534]">
                <span>Discount{coupon ? ` (${coupon.code})` : ""}</span>
                <span>- Rs {discount}</span>
              </div>
            ) : null}
            <div className="flex justify-between">
              <span>Tax</span>
              <span>Rs {tax}</span>
            </div>
            <div className="flex justify-between text-base font-black text-[#171717]">
              <span>Total</span>
              <span>Rs {total}</span>
            </div>
          </div>
          {paymentError ? (
            <p className="mt-4 rounded-md bg-[#fff0f2] px-3 py-2 text-sm font-bold text-[#b91c2b]">
              {paymentError}
            </p>
          ) : null}
          {!isLoggedIn ? (
            <div className="mt-4 rounded-md bg-[#fff8db] px-3 py-2 text-sm font-bold text-[#8a5a00]">
              Login is required before payment so your order is attached to your account.
              <Link href="/login?callbackUrl=/checkout" className="ml-2 text-[#e23744]">
                Login
              </Link>
            </div>
          ) : null}
          <button
            type="button"
            onClick={handlePaymentClick}
            disabled={isPaying}
            aria-disabled={!canPay || isPaying}
            className={`mt-6 flex justify-center rounded-md px-5 py-4 font-black text-white transition ${
              canPay && !isPaying ? "bg-[#e23744] hover:bg-[#b91c2b]" : "bg-[#9a9a92]"
            }`}
          >
            {isPaying ? "Starting payment..." : items.length > 0 ? "Pay with Razorpay" : "Back to menu"}
          </button>
        </aside>
      </section>
    </main>
  );
}
