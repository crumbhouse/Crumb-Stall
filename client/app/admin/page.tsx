import { AdminShell } from "@/components/admin-shell";

const stats = [
  { label: "Revenue today", value: "Rs 8,420" },
  { label: "Orders", value: "64" },
  { label: "Avg order", value: "Rs 132" },
  { label: "Active customers", value: "218" },
];

export default function AdminDashboardPage() {
  return (
    <AdminShell>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-600">Admin</p>
          <h1 className="mt-2 text-3xl font-black">Dashboard</h1>
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.label} className="rounded-lg bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-stone-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-black">{stat.value}</p>
          </article>
        ))}
      </div>
      <section className="mt-6 rounded-lg bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black">Live queue</h2>
        <div className="mt-4 space-y-3">
          {["CS-1007 Preparing", "CS-1008 Confirmed", "CS-1009 Ready for pickup"].map((row) => (
            <div key={row} className="rounded-lg bg-stone-50 p-4 text-sm font-bold">
              {row}
            </div>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
