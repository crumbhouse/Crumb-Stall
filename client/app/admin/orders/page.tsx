import Link from "next/link";
import { AdminOrderOtpControl } from "@/components/admin/admin-order-otp-control";
import { AdminOrderStatusControl } from "@/components/admin/admin-order-status-control";
import { AdminShell } from "@/components/admin-shell";
import { getAdminOrders } from "@/lib/admin-orders-server";

const statuses = [
  { value: "", label: "All statuses" },
  { value: "PLACED", label: "Placed" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PREPARING", label: "Preparing" },
  { value: "READY_FOR_PICKUP", label: "Ready" },
  { value: "OTP_VERIFICATION_PENDING", label: "OTP pending" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? "1");
  const status = params.status ?? "";
  const search = params.search ?? "";
  const history = await getAdminOrders({
    page: Number.isFinite(page) && page > 0 ? page : 1,
    status: status || undefined,
    search: search || undefined,
  });

  return (
    <AdminShell>
      <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-600">
        Operations
      </p>
      <h1 className="mt-2 text-3xl font-black">Order management</h1>

      <form className="mt-6 grid gap-3 rounded-lg bg-white p-4 shadow-sm sm:grid-cols-[1fr_220px_auto]">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search order, customer, or item"
          className="rounded-md border border-stone-200 px-3 py-3 text-sm font-semibold outline-none focus:border-orange-600"
        />
        <select
          name="status"
          defaultValue={status}
          className="rounded-md border border-stone-200 px-3 py-3 text-sm font-black outline-none focus:border-orange-600"
        >
          {statuses.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button className="rounded-md bg-stone-950 px-5 py-3 text-sm font-black text-white">
          Filter
        </button>
      </form>

      <div className="mt-6 overflow-hidden rounded-lg bg-white shadow-sm">
        {history.data.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-xl font-black">No orders found</p>
            <p className="mt-2 text-sm font-semibold text-stone-500">
              Try clearing filters or wait for new checkout orders.
            </p>
          </div>
        ) : (
          history.data.map((order) => (
            <div
              key={order.id}
              className="grid gap-4 border-b border-stone-100 p-4 last:border-0 xl:grid-cols-[1fr_180px_120px_360px] xl:items-center"
            >
              <div>
                <Link href={`/orders/${order.orderNumber}`} className="font-black">
                  {order.orderNumber}
                </Link>
                <p className="mt-1 text-sm font-semibold text-stone-500">
                  {order.customer.name ?? "Customer"} · {order.customer.email}
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
              <span className="w-fit rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-700">
                {order.statusLabel}
              </span>
              <p className="font-black">Rs {order.totalAmount}</p>
              <AdminOrderStatusControl
                orderNumber={order.orderNumber}
                currentStatus={order.status}
                allowedStatuses={history.allowedStatusUpdates}
              />
              {order.status === "READY_FOR_PICKUP" ||
              order.status === "OTP_VERIFICATION_PENDING" ? (
                <div className="xl:col-start-4">
                  <AdminOrderOtpControl orderNumber={order.orderNumber} />
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </AdminShell>
  );
}
