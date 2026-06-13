import Link from "next/link";
import { AdminOrderOtpControl } from "@/components/admin/admin-order-otp-control";
import { AdminOrderStatusControl } from "@/components/admin/admin-order-status-control";
import { AdminShell } from "@/components/admin-shell";
import { OrderLiveRefresh } from "@/components/order-live-refresh";
import { getAdminOrders } from "@/lib/admin-orders-server";

export const runtime = "nodejs";

const statuses = [
  { value: "", label: "All statuses" },
  { value: "PENDING_PAYMENT", label: "Pending payment" },
  { value: "PAID", label: "Placed / paid" },
  { value: "PLACED", label: "Placed" },
  { value: "PREPARING", label: "Preparing" },
  { value: "READY_FOR_PICKUP", label: "Ready for pickup" },
  { value: "OTP_VERIFICATION_PENDING", label: "Ready / OTP pending" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    status?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    minTotal?: string;
    maxTotal?: string;
    paymentStatus?: string;
    paymentProvider?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? "1");
  const status = params.status ?? "";
  const search = params.search ?? "";
  const dateFrom = params.dateFrom ?? "";
  const dateTo = params.dateTo ?? "";
  const minTotal = params.minTotal ?? "";
  const maxTotal = params.maxTotal ?? "";
  const paymentStatus = params.paymentStatus ?? "";
  const paymentProvider = params.paymentProvider ?? "";
  const history = await getAdminOrders({
    page: Number.isFinite(page) && page > 0 ? page : 1,
    status: status || undefined,
    search: search || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    minTotal: minTotal || undefined,
    maxTotal: maxTotal || undefined,
    paymentStatus: paymentStatus || undefined,
    paymentProvider: paymentProvider || undefined,
  });

  return (
    <AdminShell>
      <OrderLiveRefresh streamUrl="/api/live/admin" />
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-600">
            Operations
          </p>
          <h1 className="mt-2 text-3xl font-black">Order management</h1>
          <p className="mt-2 text-sm font-semibold text-stone-500">
            Track queue health, move orders forward, and verify pickup handovers.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:items-end">
          <Link
            href="/admin/orders/create"
            className="rounded-md bg-[#171512] px-5 py-3 text-sm font-black text-white"
          >
            Create counter order
          </Link>
          <div className="rounded-lg border border-[#e5ddd2] bg-white px-4 py-3">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-400">Found</p>
            <p className="mt-1 text-2xl font-black">{history.meta.total} orders</p>
          </div>
        </div>
      </div>

      <form className="mt-6 grid gap-3 rounded-lg border border-[#e5ddd2] bg-white p-4 shadow-sm lg:grid-cols-[1fr_180px_160px_160px_140px_140px_170px_150px_auto]">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search order, customer, phone, or item"
          className="rounded-md border border-stone-200 bg-[#fbfaf7] px-3 py-3 text-sm font-semibold outline-none focus:border-orange-600"
        />
        <select
          name="status"
          defaultValue={status}
          className="rounded-md border border-stone-200 bg-[#fbfaf7] px-3 py-3 text-sm font-black outline-none focus:border-orange-600"
        >
          {statuses.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input
          type="date"
          name="dateFrom"
          defaultValue={dateFrom}
          aria-label="Date from"
          className="rounded-md border border-stone-200 bg-[#fbfaf7] px-3 py-3 text-sm font-semibold outline-none focus:border-orange-600"
        />
        <input
          type="date"
          name="dateTo"
          defaultValue={dateTo}
          aria-label="Date to"
          className="rounded-md border border-stone-200 bg-[#fbfaf7] px-3 py-3 text-sm font-semibold outline-none focus:border-orange-600"
        />
        <input
          name="minTotal"
          inputMode="numeric"
          defaultValue={minTotal}
          placeholder="Min Rs"
          className="rounded-md border border-stone-200 bg-[#fbfaf7] px-3 py-3 text-sm font-semibold outline-none focus:border-orange-600"
        />
        <input
          name="maxTotal"
          inputMode="numeric"
          defaultValue={maxTotal}
          placeholder="Max Rs"
          className="rounded-md border border-stone-200 bg-[#fbfaf7] px-3 py-3 text-sm font-semibold outline-none focus:border-orange-600"
        />
        <select
          name="paymentStatus"
          defaultValue={paymentStatus}
          className="rounded-md border border-stone-200 bg-[#fbfaf7] px-3 py-3 text-sm font-black outline-none focus:border-orange-600"
        >
          <option value="">All payments</option>
          <option value="NONE">Cash / no payment</option>
          <option value="CREATED">Payment created</option>
          <option value="CAPTURED">Captured</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>
        <select
          name="paymentProvider"
          defaultValue={paymentProvider}
          className="rounded-md border border-stone-200 bg-[#fbfaf7] px-3 py-3 text-sm font-black outline-none focus:border-orange-600"
        >
          <option value="">All modes</option>
          <option value="RAZORPAY">Online</option>
          <option value="CASH">Cash</option>
        </select>
        <button className="rounded-md bg-[#171512] px-5 py-3 text-sm font-black text-white">
          Filter
        </button>
      </form>

      <div className="mt-6 overflow-hidden rounded-lg border border-[#e5ddd2] bg-white shadow-sm">
        {history.data.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-xl font-black">No orders found</p>
            <p className="mt-2 text-sm font-semibold text-stone-500">
              Try clearing filters or wait for new checkout orders.
            </p>
          </div>
        ) : (
          history.data.map((order) => (
            <article
              key={order.id}
              className="grid gap-4 border-b border-[#eee8df] p-4 last:border-0 xl:grid-cols-[minmax(0,1.2fr)_170px_150px_minmax(320px,0.9fr)] xl:items-center"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/admin/orders/${order.orderNumber}`} className="text-lg font-black">
                    {order.orderNumber}
                  </Link>
                  <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-700">
                    {order.statusLabel}
                  </span>
                </div>
                <p className="mt-1 text-sm font-semibold text-stone-500">
                  {order.customer.name ?? "Customer"} · {formatCustomerContact(order.customer)}
                </p>
                {order.itemPreview.length > 0 ? (
                  <p className="mt-2 text-sm font-semibold text-stone-600">
                    {order.itemPreview.join(", ")}
                    {order.itemCount > order.itemPreview.length
                      ? ` +${order.itemCount - order.itemPreview.length} more`
                      : ""}
                  </p>
                ) : null}
              </div>
              <div className="rounded-lg bg-[#fbfaf7] p-3">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-stone-400">
                  Customer
                </p>
                <p className="mt-1 truncate text-sm font-black">{order.customer.name ?? "Customer"}</p>
                <p className="mt-1 truncate text-xs font-semibold text-stone-500">
                  {formatCustomerContact(order.customer)}
                </p>
              </div>
              <div className="rounded-lg bg-[#171512] p-3 text-white">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-white/50">
                  Amount
                </p>
                <p className="mt-1 text-xl font-black">Rs {order.totalAmount}</p>
              </div>
              <div className="rounded-lg border border-[#eee8df] bg-[#fbfaf7] p-3">
                <p className="mb-2 text-xs font-black uppercase tracking-[0.12em] text-stone-400">
                  Next action
                </p>
                <AdminOrderStatusControl
                  orderNumber={order.orderNumber}
                  currentStatus={order.status}
                  allowedStatuses={order.allowedStatusUpdates}
                />
              </div>
              {order.status === "READY_FOR_PICKUP" || order.status === "OTP_VERIFICATION_PENDING" ? (
                <div className="rounded-lg border border-green-100 bg-green-50 p-3 xl:col-start-4">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-green-800">
                    Pickup handover
                  </p>
                  <p className="mt-1 text-xs font-semibold text-green-700">
                    Ask the customer for the 6-digit OTP shown on their order screen.
                  </p>
                  <AdminOrderOtpControl orderNumber={order.orderNumber} />
                </div>
              ) : null}
            </article>
          ))
        )}
      </div>
    </AdminShell>
  );
}

function formatCustomerContact(customer: { email: string; phone?: string | null }) {
  if (customer.phone) {
    return customer.phone;
  }

  return customer.email.includes("@crumbstall.local") ? "Counter customer" : customer.email;
}
