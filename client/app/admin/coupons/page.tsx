import { AdminShell } from "@/components/admin-shell";

const coupons = [
  ["WELCOME10", "10% off", "Rs 99 min"],
  ["SAVE50", "Rs 50 off", "Rs 299 min"],
];

export default function AdminCouponsPage() {
  return (
    <AdminShell>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-600">Growth</p>
          <h1 className="mt-2 text-3xl font-black">Coupons</h1>
        </div>
        <button className="rounded-full bg-stone-950 px-5 py-3 text-sm font-black text-white">
          New coupon
        </button>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {coupons.map(([code, value, minimum]) => (
          <article key={code} className="rounded-lg bg-white p-5 shadow-sm">
            <p className="text-2xl font-black">{code}</p>
            <p className="mt-2 font-bold text-orange-700">{value}</p>
            <p className="mt-1 text-sm text-stone-500">{minimum}</p>
          </article>
        ))}
      </div>
    </AdminShell>
  );
}
