import { AdminShell } from "@/components/admin-shell";

export default function AdminAnalyticsPage() {
  return (
    <AdminShell>
      <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-600">Insights</p>
      <h1 className="mt-2 text-3xl font-black">Analytics</h1>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-lg bg-white p-5 shadow-sm">
          <h2 className="font-black">Revenue trend</h2>
          <div className="mt-6 flex h-52 items-end gap-3">
            {[45, 80, 62, 96, 74, 110, 132].map((height, index) => (
              <div key={index} className="flex flex-1 items-end rounded-t-lg bg-orange-100">
                <span className="w-full rounded-t-lg bg-orange-600" style={{ height }} />
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-lg bg-white p-5 shadow-sm">
          <h2 className="font-black">Best sellers</h2>
          <div className="mt-5 space-y-3">
            {["Classic Veg Burger", "Steamed Momos", "Burger + Coffee Combo"].map((item) => (
              <div key={item} className="rounded-lg bg-stone-50 p-4 font-bold">
                {item}
              </div>
            ))}
          </div>
        </article>
      </div>
    </AdminShell>
  );
}
