import Link from "next/link";
import { CustomerNav } from "@/components/customer-nav";
import { getOrderDetail, type OrderDetail } from "@/lib/orders";

export default async function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const order = await getOrderDetail(orderId);

  if (!order) {
    return (
      <main className="min-h-screen bg-[#f6f6f4] text-[#171717]">
        <CustomerNav />
        <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <div className="rounded-lg border border-dashed border-[#d7d7cf] bg-white p-8 text-center">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#e23744]">
              Order tracking
            </p>
            <h1 className="mt-2 text-3xl font-black">Order not found</h1>
            <p className="mt-3 text-sm font-semibold text-[#646464]">
              We could not find `{orderId}` in the order system yet.
            </p>
            <Link
              href="/menu"
              className="mt-6 inline-flex rounded-md bg-[#e23744] px-5 py-3 font-black text-white"
            >
              Back to menu
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f6f4] text-[#171717]">
      <CustomerNav />
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_360px]">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[#e23744]">
            Order tracking
          </p>
          <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-black">{order.orderNumber}</h1>
              <p className="mt-1 text-sm font-semibold text-[#646464]">
                Placed {formatDateTime(order.placedAt)}
              </p>
            </div>
            <span className="inline-flex h-8 w-fit items-center rounded-md bg-[#fff0f2] px-3 text-sm font-black text-[#b91c2b]">
              {order.statusLabel}
            </span>
          </div>

          <div className="mt-6 rounded-lg border border-[#e8e8e3] bg-white p-5 shadow-sm">
            {order.timeline.map((step, index) => (
              <div key={step.status} className="flex gap-4 pb-6 last:pb-0">
                <span
                  className={`mt-1 size-4 shrink-0 rounded-full ${
                    step.state === "done" || step.state === "current"
                      ? "bg-[#e23744]"
                      : "bg-[#d7d7cf]"
                  }`}
                />
                <div className={index === order.timeline.length - 1 ? "" : "pb-1"}>
                  <p className="font-black">{step.label}</p>
                  <p className="mt-1 text-sm font-semibold text-[#646464]">{step.description}</p>
                  {step.timestamp ? (
                    <p className="mt-1 text-xs font-bold text-[#8b8b8b]">
                      {formatDateTime(step.timestamp)}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          {order.pickupOtp ? (
            <div className="mt-6 rounded-lg border border-[#b7e4c7] bg-[#ecfdf3] p-5 shadow-sm">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-[#166534]">
                Pickup OTP
              </p>
              <p className="mt-3 text-5xl font-black tracking-[0.18em] text-[#14532d]">
                {formatOtp(order.pickupOtp.code)}
              </p>
              <p className="mt-3 text-sm font-bold text-[#166534]">
                Show this code at the counter. It expires {formatDateTime(order.pickupOtp.expiresAt)}.
              </p>
            </div>
          ) : (
            <div className="mt-6 rounded-lg border border-[#e8e8e3] bg-white p-5 shadow-sm">
              <p className="font-black">Pickup OTP</p>
              <p className="mt-2 text-sm font-semibold text-[#646464]">
                Your OTP will appear here once the stall marks the order ready for pickup.
              </p>
            </div>
          )}

          <OrderItems order={order} />
        </div>

        <aside className="h-fit rounded-lg border border-[#e8e8e3] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black">Pickup summary</h2>
          <div className="mt-5 space-y-3 text-sm text-[#555]">
            <div className="flex justify-between gap-4">
              <span>Pickup time</span>
              <span className="font-black text-[#171717]">{formatDateTime(order.pickupTime)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Payment</span>
              <span className="font-black text-[#171717]">{order.payment?.status ?? "Captured"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Subtotal</span>
              <span>Rs {order.subtotalAmount}</span>
            </div>
            {order.discountAmount > 0 ? (
              <div className="flex justify-between gap-4 text-[#166534]">
                <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                <span>- Rs {order.discountAmount}</span>
              </div>
            ) : null}
            <div className="flex justify-between gap-4">
              <span>Tax</span>
              <span>Rs {order.taxAmount}</span>
            </div>
            <div className="flex justify-between gap-4 border-t border-[#e8e8e3] pt-3 text-base font-black text-[#171717]">
              <span>Total</span>
              <span>Rs {order.totalAmount}</span>
            </div>
          </div>
          <Link
            href={`/invoices/INV-${order.orderNumber}`}
            className="mt-6 flex justify-center rounded-md bg-[#171717] px-5 py-3 font-black text-white"
          >
            View invoice
          </Link>
        </aside>
      </section>
    </main>
  );
}

function OrderItems({ order }: { order: OrderDetail }) {
  return (
    <div className="mt-6 rounded-lg border border-[#e8e8e3] bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black">Items</h2>
      <div className="mt-4 space-y-3">
        {order.items.map((item) => (
          <div key={item.id} className="text-sm">
            <div className="flex justify-between gap-4">
              <span className="font-semibold text-[#555]">
                {item.quantity} x {item.name}
              </span>
              <span className="font-black">Rs {item.totalPrice}</span>
            </div>
            {item.note ? (
              <p className="mt-1 rounded-md bg-[#f9f9f7] px-2 py-1 text-xs font-semibold text-[#646464]">
                Note: {item.note}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDateTime(value: string | undefined | null) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatOtp(code: string) {
  return `${code.slice(0, 3)} ${code.slice(3)}`;
}
