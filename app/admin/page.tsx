import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import {
  getAdminAnalyticsSummary,
  getLiveQueue,
  getRevenueTrend,
  getTopFoods,
  type LiveQueueOrder,
} from "@/lib/admin-analytics";

export default async function AdminDashboardPage() {
  const [summary, queue, trend, topFoods] = await Promise.all([
    getAdminAnalyticsSummary(),
    getLiveQueue(5),
    getRevenueTrend(7),
    getTopFoods({ days: 30, limit: 4 }),
  ]);

  const summaryData = summary?.data;
  const trendData = trend?.data ?? [];
  const queueData = queue?.data ?? [];
  const topFoodData = topFoods?.data ?? [];

  const stats = [
    { label: "Revenue today", value: formatCurrency(summaryData?.revenueToday ?? 0) },
    { label: "Orders today", value: formatNumber(summaryData?.ordersToday ?? 0) },
    {
      label: "Avg order",
      value: formatCurrency(summaryData?.averageOrderValueToday ?? 0),
    },
    {
      label: "Live queue",
      value: formatNumber(summaryData?.liveQueueCount ?? queueData.length),
    },
  ];

  return (
    <AdminShell>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-600">Admin</p>
          <h1 className="mt-2 text-3xl font-black">Dashboard</h1>
          <p className="mt-2 text-sm font-semibold text-stone-500">
            Live operational snapshot for today&apos;s orders and revenue.
          </p>
        </div>
        <Link
          href="/admin/analytics"
          className="w-fit rounded-md bg-[#171512] px-4 py-3 text-sm font-black text-white"
        >
          View analytics
        </Link>
      </div>

      {!summary ? (
        <div className="mt-6 rounded-lg border border-orange-100 bg-orange-50 p-4 text-sm font-bold text-orange-800">
          Analytics data could not be loaded. Confirm the backend is running and your admin session is
          valid.
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.label} className="rounded-lg border border-[#e5ddd2] bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-400">
              {stat.label}
            </p>
            <p className="mt-3 text-3xl font-black">{stat.value}</p>
          </article>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-lg border border-[#e5ddd2] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black">Revenue trend</h2>
              <p className="mt-1 text-sm font-semibold text-stone-500">Last 7 days</p>
            </div>
            <p className="text-sm font-black text-orange-700">
              {formatCurrency(trendData.reduce((total, point) => total + point.revenue, 0))}
            </p>
          </div>
          <RevenueBars data={trendData} />
        </section>

        <section className="rounded-lg border border-[#e5ddd2] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black">Best sellers</h2>
          <p className="mt-1 text-sm font-semibold text-stone-500">Last 30 days</p>
          <div className="mt-5 space-y-3">
            {topFoodData.length === 0 ? (
              <EmptyState text="No paid food sales yet." />
            ) : (
              topFoodData.map((item) => (
                <div key={item.foodItemId} className="rounded-lg bg-[#fbfaf7] p-4">
                  <div className="flex justify-between gap-3">
                    <p className="font-black">{item.name}</p>
                    <p className="shrink-0 text-sm font-black text-orange-700">
                      {formatCurrency(item.revenue)}
                    </p>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-stone-500">
                    {item.quantitySold} sold
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-lg border border-[#e5ddd2] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black">Live queue</h2>
            <p className="mt-1 text-sm font-semibold text-stone-500">
              Orders that still need kitchen or pickup action.
            </p>
          </div>
          <Link href="/admin/orders" className="text-sm font-black text-orange-700">
            Manage orders
          </Link>
        </div>
        <QueueList orders={queueData} />
      </section>
    </AdminShell>
  );
}

function RevenueBars({ data }: { data: { date: string; revenue: number; orders: number }[] }) {
  const maxRevenue = Math.max(...data.map((point) => point.revenue), 0);

  if (data.length === 0) {
    return <EmptyState text="No revenue data available yet." />;
  }

  return (
    <div className="mt-6 flex h-56 items-end gap-3">
      {data.map((point) => {
        const height = maxRevenue > 0 ? Math.max(8, Math.round((point.revenue / maxRevenue) * 100)) : 8;

        return (
          <div key={point.date} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div className="flex h-44 w-full items-end rounded-t-lg bg-orange-50">
              <span className="w-full rounded-t-lg bg-orange-600" style={{ height: `${height}%` }} />
            </div>
            <div className="text-center">
              <p className="text-xs font-black text-stone-700">{formatShortDate(point.date)}</p>
              <p className="text-[11px] font-semibold text-stone-500">{point.orders} orders</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function QueueList({ orders }: { orders: LiveQueueOrder[] }) {
  if (orders.length === 0) {
    return <EmptyState text="No active orders in the queue." />;
  }

  return (
    <div className="mt-5 space-y-3">
      {orders.map((order) => (
        <div
          key={order.id}
          className="grid gap-3 rounded-lg bg-[#fbfaf7] p-4 md:grid-cols-[1fr_140px_120px] md:items-center"
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
              </p>
            ) : null}
          </div>
          <span className="w-fit rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">
            {order.statusLabel}
          </span>
          <p className="font-black">{formatCurrency(order.totalAmount)}</p>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="mt-5 rounded-lg border border-dashed border-stone-200 bg-stone-50 p-5 text-center text-sm font-bold text-stone-500">
      {text}
    </div>
  );
}

function formatCurrency(value: number) {
  return `Rs ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value)}`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}
