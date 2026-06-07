import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { getCustomerInsights, type CustomerInsights } from "@/lib/admin-analytics";

type Customer = CustomerInsights["data"]["customers"][number];

export default async function AdminCustomersPage() {
  const insights = await getCustomerInsights(20);
  const summary = insights?.data.summary;
  const customers = insights?.data.customers ?? [];

  return (
    <AdminShell>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-600">
            Customer insights
          </p>
          <h1 className="mt-2 text-3xl font-black">Customers</h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-stone-500">
            Understand who orders often, who is new, and where repeat demand is coming from.
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="w-fit rounded-md bg-[#171512] px-4 py-3 text-sm font-black text-white"
        >
          View orders
        </Link>
      </div>

      {!insights ? (
        <div className="mt-6 rounded-lg border border-orange-100 bg-orange-50 p-4 text-sm font-bold text-orange-800">
          Customer insights could not be loaded. Confirm the backend is running and this admin
          session is still valid.
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Total customers" value={formatNumber(summary?.totalCustomers ?? 0)} />
        <MetricCard
          label="New in 30 days"
          value={formatNumber(summary?.newCustomers30Days ?? 0)}
        />
        <MetricCard
          label="Active in 30 days"
          value={formatNumber(summary?.activeCustomers30Days ?? 0)}
        />
        <MetricCard
          label="Repeat customers"
          value={formatNumber(summary?.repeatCustomers ?? 0)}
          helper={`${summary?.repeatRate ?? 0}% repeat rate`}
        />
        <MetricCard
          label="Average lifetime value"
          value={formatCurrency(summary?.averageLifetimeValue ?? 0)}
        />
        <MetricCard
          label="Tracked top customers"
          value={formatNumber(customers.length)}
          helper="Sorted by spend"
        />
      </div>

      <section className="mt-6 overflow-hidden rounded-lg border border-[#e5ddd2] bg-white shadow-sm">
        <div className="border-b border-stone-100 p-5">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-600">
            Top customers
          </p>
          <h2 className="mt-2 text-2xl font-black">Highest lifetime spend</h2>
        </div>
        <CustomerTable customers={customers} />
      </section>
    </AdminShell>
  );
}

function MetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <article className="rounded-lg border border-[#e5ddd2] bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-stone-400">{label}</p>
      <p className="mt-3 text-3xl font-black">{value}</p>
      {helper ? <p className="mt-1 text-xs font-black text-orange-700">{helper}</p> : null}
    </article>
  );
}

function CustomerTable({ customers }: { customers: Customer[] }) {
  if (customers.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-xl font-black">No customer order data yet</p>
        <p className="mt-2 text-sm font-semibold text-stone-500">
          Customers will appear here after paid orders are placed.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-[#eee8df]">
      {customers.map((customer) => (
        <div
          key={customer.userId}
          className="grid gap-4 p-5 xl:grid-cols-[minmax(0,1fr)_120px_130px_160px_170px] xl:items-center"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#171512] text-sm font-black text-white">
                {(customer.name ?? customer.email).slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate font-black">{customer.name ?? "Customer"}</p>
                <p className="mt-1 truncate text-sm font-semibold text-stone-500">{customer.email}</p>
              </div>
            </div>
          </div>
          <Stat label="Orders" value={formatNumber(customer.orderCount)} tone="soft" />
          <Stat label="Items" value={formatNumber(customer.itemCount)} tone="soft" />
          <Stat label="Total spend" value={formatCurrency(customer.totalSpend)} tone="dark" />
          <div className="rounded-lg bg-[#fbfaf7] p-3">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-stone-400">
              Last order
            </p>
            <p className="mt-1 text-sm font-black">{formatDate(customer.lastOrderAt)}</p>
            <p className="mt-1 text-xs font-semibold text-stone-500">
              AOV {formatCurrency(customer.averageOrderValue)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Stat({ label, value, tone = "plain" }: { label: string; value: string; tone?: "plain" | "soft" | "dark" }) {
  return (
    <div
      className={`rounded-lg p-3 ${
        tone === "dark" ? "bg-[#171512] text-white" : tone === "soft" ? "bg-[#fbfaf7]" : ""
      }`}
    >
      <p
        className={`text-xs font-black uppercase tracking-[0.12em] ${
          tone === "dark" ? "text-white/50" : "text-stone-400"
        }`}
      >
        {label}
      </p>
      <p className="mt-1 text-sm font-black">{value}</p>
    </div>
  );
}

function formatCurrency(value: number) {
  return `Rs ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value)}`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function formatDate(value: string | null) {
  if (!value) {
    return "No orders";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(value));
}
