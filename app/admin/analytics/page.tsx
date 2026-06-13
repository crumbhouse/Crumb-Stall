import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import {
  getAdminAnalyticsSummary,
  getLiveQueue,
  getRevenueTrend,
  getTopFoods,
  type LiveQueueOrder,
  type RevenueTrendPoint,
  type TopFood,
} from "@/lib/admin-analytics";

export default async function AdminAnalyticsPage() {
  const [summary, trend, topFoods, queue] = await Promise.all([
    getAdminAnalyticsSummary(),
    getRevenueTrend(14),
    getTopFoods({ days: 30, limit: 8 }),
    getLiveQueue(8),
  ]);

  const trendData = trend?.data ?? [];
  const topFoodData = topFoods?.data ?? [];
  const queueData = queue?.data ?? [];
  const summaryData = summary?.data;

  return (
    <AdminShell>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-600">
            Insights
          </p>
          <h1 className="mt-2 text-3xl font-black">Analytics</h1>
          <p className="mt-2 text-sm font-semibold text-stone-500">
            Revenue, food demand, and active queue health from real order data.
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="w-fit rounded-md bg-[#171512] px-4 py-3 text-sm font-black text-white"
        >
          Manage orders
        </Link>
      </div>

      {!summary || !trend || !topFoods || !queue ? (
        <div className="mt-6 rounded-lg border border-orange-100 bg-orange-50 p-4 text-sm font-bold text-orange-800">
          Some analytics data could not be loaded. Confirm the backend is running and this admin
          session is still valid.
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Revenue today" value={formatCurrency(summaryData?.revenueToday ?? 0)} />
        <MetricCard label="Orders today" value={formatNumber(summaryData?.ordersToday ?? 0)} />
        <MetricCard
          label="Completed today"
          value={formatNumber(summaryData?.completedOrdersToday ?? 0)}
        />
        <MetricCard
          label="Cancelled today"
          value={formatNumber(summaryData?.cancelledOrdersToday ?? 0)}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="rounded-lg border border-[#e5ddd2] bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <h2 className="text-xl font-black">Revenue trend</h2>
              <p className="mt-1 text-sm font-semibold text-stone-500">Last 14 days</p>
            </div>
            <div className="rounded-lg bg-orange-50 px-3 py-2 text-sm font-black text-orange-700">
              {formatCurrency(totalRevenue(trendData))}
            </div>
          </div>
          <RevenueBars data={trendData} />
        </section>

        <section className="rounded-lg border border-[#e5ddd2] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black">Best sellers</h2>
          <p className="mt-1 text-sm font-semibold text-stone-500">Last 30 days</p>
          <TopFoodsList foods={topFoodData} />
        </section>
      </div>

      <section className="mt-6 rounded-lg border border-[#e5ddd2] bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <h2 className="text-xl font-black">Live queue health</h2>
            <p className="mt-1 text-sm font-semibold text-stone-500">
              Orders currently waiting for kitchen progress, pickup, or OTP handover.
            </p>
          </div>
          <div className="rounded-lg bg-[#fbfaf7] px-3 py-2 text-sm font-black">
            {queueData.length} active
          </div>
        </div>
        <QueueTable orders={queueData} />
      </section>
    </AdminShell>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-lg border border-[#e5ddd2] bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-400">{label}</p>
      <p className="mt-3 text-3xl font-black">{value}</p>
    </article>
  );
}

function RevenueBars({ data }: { data: RevenueTrendPoint[] }) {
  const maxRevenue = Math.max(...data.map((point) => point.revenue), 0);

  if (data.length === 0) {
    return <EmptyState text="No revenue data available yet." />;
  }

  return (
    <div className="mt-6 overflow-x-auto pb-2">
      <div className="flex min-w-[720px] items-end gap-3">
        {data.map((point) => {
          const height =
            maxRevenue > 0 ? Math.max(8, Math.round((point.revenue / maxRevenue) * 100)) : 8;

          return (
            <div key={point.date} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div className="flex h-56 w-full items-end rounded-t-lg bg-orange-50">
                <span
                  className="w-full rounded-t-lg bg-orange-600"
                  style={{ height: `${height}%` }}
                  title={`${formatCurrency(point.revenue)} from ${point.orders} orders`}
                />
              </div>
              <div className="text-center">
                <p className="text-xs font-black text-stone-700">{formatShortDate(point.date)}</p>
                <p className="text-[11px] font-semibold text-stone-500">
                  {formatCurrency(point.revenue)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TopFoodsList({ foods }: { foods: TopFood[] }) {
  if (foods.length === 0) {
    return <EmptyState text="No paid food sales yet." />;
  }

  const maxQuantity = Math.max(...foods.map((food) => food.quantitySold), 1);

  return (
    <div className="mt-5 space-y-4">
      {foods.map((food) => {
        const width = Math.max(8, Math.round((food.quantitySold / maxQuantity) * 100));

        return (
          <div key={food.foodItemId}>
            <div className="flex justify-between gap-4">
              <p className="min-w-0 font-black">{food.name}</p>
              <p className="shrink-0 text-sm font-black text-orange-700">
                {formatCurrency(food.revenue)}
              </p>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100">
              <span className="block h-full rounded-full bg-orange-600" style={{ width: `${width}%` }} />
            </div>
            <p className="mt-1 text-xs font-bold text-stone-500">{food.quantitySold} sold</p>
          </div>
        );
      })}
    </div>
  );
}

function QueueTable({ orders }: { orders: LiveQueueOrder[] }) {
  if (orders.length === 0) {
    return <EmptyState text="No active orders in the queue." />;
  }

  return (
    <div className="mt-5 overflow-hidden rounded-lg border border-stone-100">
      {orders.map((order) => (
        <div
          key={order.id}
          className="grid gap-3 border-b border-stone-100 p-4 last:border-0 xl:grid-cols-[1fr_160px_160px_120px] xl:items-center"
        >
          <div>
            <Link href={`/admin/orders/${order.orderNumber}`} className="font-black">
              {order.orderNumber}
            </Link>
            <p className="mt-1 text-sm font-semibold text-stone-500">
              {order.customer.name ?? "Customer"} · {formatCustomerContact(order.customer)}
            </p>
          </div>
          <span className="w-fit rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">
            {order.statusLabel}
          </span>
          <p className="text-sm font-bold text-stone-600">
            Pickup {formatDateTime(order.pickupTime)}
          </p>
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

function totalRevenue(data: RevenueTrendPoint[]) {
  return data.reduce((total, point) => total + point.revenue, 0);
}

function formatCurrency(value: number) {
  return `Rs ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value)}`;
}

function formatCustomerContact(customer: { email: string; phone?: string | null }) {
  if (customer.phone) {
    return customer.phone;
  }

  return customer.email.includes("@crumbstall.local") ? "Counter customer" : customer.email;
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

function formatDateTime(value: string | null) {
  if (!value) {
    return "not set";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
