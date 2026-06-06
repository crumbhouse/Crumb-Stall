import Link from "next/link";
import { AdminOrderOtpControl } from "@/components/admin/admin-order-otp-control";
import { AdminOrderStatusControl } from "@/components/admin/admin-order-status-control";
import { AdminShell } from "@/components/admin-shell";
import { OrderLiveRefresh } from "@/components/order-live-refresh";
import { getAdminOrder } from "@/lib/admin-orders-server";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const { order, error } = await getAdminOrder(orderNumber);

  if (!order) {
    const isNotFound = error?.status === 404;

    return (
      <AdminShell>
        <div className="rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-600">Orders</p>
          <h1 className="mt-2 text-3xl font-black">
            {isNotFound ? "Order not found" : "Order could not load"}
          </h1>
          <p className="mt-2 text-sm font-semibold text-stone-500">
            {isNotFound
              ? `\`${orderNumber}\` is not available in the admin order system.`
              : error?.message}
          </p>
          {!isNotFound && error?.status ? (
            <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-orange-600">
              Status {error.status}
            </p>
          ) : null}
          <Link
            href="/admin/orders"
            className="mt-6 inline-flex rounded-md bg-stone-950 px-5 py-3 font-black text-white"
          >
            Back to orders
          </Link>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <OrderLiveRefresh streamUrl="/api/live/admin" />
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-600">
            Order detail
          </p>
          <h1 className="mt-2 text-3xl font-black">{order.orderNumber}</h1>
          <p className="mt-1 text-sm font-semibold text-stone-500">
            {order.customer.name ?? "Customer"} · {order.customer.email}
          </p>
        </div>
        <span className="w-fit rounded-full bg-orange-50 px-4 py-2 text-sm font-black text-orange-700">
          {order.statusLabel}
        </span>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="rounded-lg bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black">Items</h2>
            <div className="mt-4 space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-3 rounded-lg bg-stone-50 p-4 sm:grid-cols-[1fr_90px_110px]"
                >
                  <div>
                    <p className="font-black">{item.name}</p>
                    {item.note ? (
                      <p className="mt-1 text-xs font-semibold text-stone-500">Note: {item.note}</p>
                    ) : null}
                  </div>
                  <p className="text-sm font-bold text-stone-600">
                    {item.quantity} x Rs {item.unitPrice}
                  </p>
                  <p className="font-black">Rs {item.totalPrice}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black">Status timeline</h2>
            <div className="mt-4 space-y-4">
              {order.timeline.map((step) => (
                <div key={step.status} className="flex gap-3">
                  <span
                    className={`mt-1 size-3 shrink-0 rounded-full ${
                      step.state === "done" || step.state === "current"
                        ? "bg-orange-600"
                        : "bg-stone-300"
                    }`}
                  />
                  <div>
                    <p className="font-black">{step.label}</p>
                    <p className="text-sm font-semibold text-stone-500">{step.description}</p>
                    {step.timestamp ? (
                      <p className="mt-1 text-xs font-bold text-stone-400">
                        {formatDateTime(step.timestamp)}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="h-fit space-y-4">
          <section className="rounded-lg bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black">Admin actions</h2>
            <div className="mt-4">
              <AdminOrderStatusControl
                orderNumber={order.orderNumber}
                currentStatus={order.status}
                allowedStatuses={order.allowedStatusUpdates}
              />
            </div>
            {order.status === "READY_FOR_PICKUP" || order.status === "OTP_VERIFICATION_PENDING" ? (
              <div className="mt-4 rounded-lg bg-green-50 p-3">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-green-800">
                  Pickup handover
                </p>
                <p className="mt-1 text-xs font-semibold text-green-700">
                  Customer OTP expires{" "}
                  {order.pickupOtp ? formatDateTime(order.pickupOtp.expiresAt) : "after generation"}.
                </p>
                <AdminOrderOtpControl orderNumber={order.orderNumber} />
              </div>
            ) : null}
          </section>

          <section className="rounded-lg bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black">Order summary</h2>
            <div className="mt-4 space-y-3 text-sm text-stone-600">
              <SummaryRow label="Placed" value={formatDateTime(order.placedAt)} />
              <SummaryRow label="Pickup" value={formatDateTime(order.pickupTime)} />
              <SummaryRow label="Payment" value={formatPaymentStatus(order.payment?.status)} />
              <SummaryRow label="Provider" value={order.payment?.provider ?? "Not available"} />
              <SummaryRow label="Payment ID" value={order.payment?.paymentId ?? "Not available"} />
              <SummaryRow label="Subtotal" value={`Rs ${order.subtotalAmount}`} />
              {order.discountAmount > 0 ? (
                <SummaryRow
                  label={`Discount${order.couponCode ? ` (${order.couponCode})` : ""}`}
                  value={`- Rs ${order.discountAmount}`}
                />
              ) : null}
              <SummaryRow label="Tax" value={`Rs ${order.taxAmount}`} />
              <div className="flex justify-between gap-4 border-t border-stone-200 pt-3 text-base font-black text-stone-950">
                <span>Total</span>
                <span>Rs {order.totalAmount}</span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </AdminShell>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span>{label}</span>
      <span className="text-right font-black text-stone-950">{value}</span>
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

function formatPaymentStatus(status: string | undefined | null) {
  switch (status) {
    case "CAPTURED":
      return "Captured";
    case "CREATED":
      return "Payment created";
    case "FAILED":
      return "Failed";
    case "REFUNDED":
      return "Refunded";
    default:
      return "Not available";
  }
}
