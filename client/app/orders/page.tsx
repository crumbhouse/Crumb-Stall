import Link from "next/link";
import type { ReactNode } from "react";
import { CustomerNav } from "@/components/customer-nav";
import { MobileBar } from "@/components/mobile-bar";
import { OrderLiveRefresh } from "@/components/order-live-refresh";
import { OrdersFilterForm } from "@/components/orders-filter-form";
import { getRecentOrders } from "@/lib/orders";

const statuses = [
  { value: "", label: "All statuses" },
  { value: "PLACED", label: "Placed" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PREPARING", label: "Preparing" },
  { value: "READY_FOR_PICKUP", label: "Ready" },
  { value: "COMPLETED", label: "Completed" },
];

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? "1");
  const status = params.status ?? "";
  const search = params.search ?? "";
  const history = await getRecentOrders({
    page: Number.isFinite(page) && page > 0 ? page : 1,
    status: status || undefined,
    search: search || undefined,
  });
  const orders = history.data;

  return (
    <main className="min-h-screen bg-[#f6f6f4] pb-20 text-[#171717]">
      <OrderLiveRefresh />
      <CustomerNav />
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-[#e23744]">
          Order history
        </p>
        <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-black">Your recent orders</h1>
            <p className="mt-1 text-sm font-semibold text-[#646464]">
              {history.meta.total} orders found
            </p>
          </div>
          <Link href="/menu" className="w-fit rounded-md bg-[#e23744] px-4 py-2 text-sm font-black text-white">
            New order
          </Link>
        </div>

        <OrdersFilterForm initialSearch={search} initialStatus={status} statuses={statuses} />

        {orders.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-[#d7d7cf] bg-white p-8 text-center">
            <p className="text-2xl font-black">No orders found</p>
            <p className="mt-2 text-sm font-semibold text-[#646464]">
              Try clearing filters or place a new order from the menu.
            </p>
            <Link
              href="/orders"
              className="mt-6 inline-flex rounded-md bg-[#e23744] px-5 py-3 font-black text-white"
            >
              Clear filters
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.orderNumber}`}
                className="block rounded-lg border border-[#e8e8e3] bg-white p-5 shadow-sm transition hover:border-[#e23744]"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <p className="font-black">{order.orderNumber}</p>
                    <p className="mt-1 text-sm font-semibold text-[#646464]">
                      {formatDateTime(order.placedAt)} · {order.itemCount} items
                    </p>
                    {order.itemPreview.length > 0 ? (
                      <p className="mt-2 text-sm font-semibold text-[#555]">
                        {order.itemPreview.join(", ")}
                      </p>
                    ) : null}
                  </div>
                  <span className="w-fit rounded-md bg-[#fff0f2] px-3 py-1 text-sm font-black text-[#b91c2b]">
                    {order.statusLabel}
                  </span>
                </div>
                <p className="mt-4 font-black">Rs {order.totalAmount}</p>
              </Link>
            ))}
          </div>
        )}

        {history.meta.totalPages > 1 ? (
          <div className="mt-6 flex items-center justify-between rounded-lg border border-[#e8e8e3] bg-white p-4">
            <PaginationLink
              disabled={history.meta.page <= 1}
              page={history.meta.page - 1}
              status={status}
              search={search}
            >
              Previous
            </PaginationLink>
            <span className="text-sm font-black text-[#555]">
              Page {history.meta.page} of {history.meta.totalPages}
            </span>
            <PaginationLink
              disabled={history.meta.page >= history.meta.totalPages}
              page={history.meta.page + 1}
              status={status}
              search={search}
            >
              Next
            </PaginationLink>
          </div>
        ) : null}
      </section>
      <MobileBar />
    </main>
  );
}

function PaginationLink({
  children,
  disabled,
  page,
  status,
  search,
}: {
  children: ReactNode;
  disabled: boolean;
  page: number;
  status: string;
  search: string;
}) {
  const params = new URLSearchParams({ page: String(page) });

  if (status) {
    params.set("status", status);
  }

  if (search) {
    params.set("search", search);
  }

  if (disabled) {
    return <span className="text-sm font-black text-[#aaa]">{children}</span>;
  }

  return (
    <Link href={`/orders?${params.toString()}`} className="text-sm font-black text-[#e23744]">
      {children}
    </Link>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
