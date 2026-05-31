import { AdminShell } from "@/components/admin-shell";

const orders = [
  ["CS-1007", "Preparing", "Rs 226"],
  ["CS-1008", "Confirmed", "Rs 139"],
  ["CS-1009", "OTP pending", "Rs 79"],
];

export default function AdminOrdersPage() {
  return (
    <AdminShell>
      <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-600">Operations</p>
      <h1 className="mt-2 text-3xl font-black">Order management</h1>
      <div className="mt-6 overflow-hidden rounded-lg bg-white shadow-sm">
        {orders.map(([id, status, total]) => (
          <div key={id} className="grid gap-4 border-b border-stone-100 p-4 last:border-0 sm:grid-cols-[1fr_160px_100px_140px] sm:items-center">
            <p className="font-black">{id}</p>
            <span className="w-fit rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-700">
              {status}
            </span>
            <p className="font-black">{total}</p>
            <button className="rounded-full bg-stone-950 px-4 py-2 text-sm font-black text-white">
              Update
            </button>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
