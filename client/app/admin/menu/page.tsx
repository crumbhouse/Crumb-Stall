import { AdminShell } from "@/components/admin-shell";
import { fallbackFoods } from "@/lib/catalog";

export default function AdminMenuPage() {
  return (
    <AdminShell>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-600">Catalog</p>
          <h1 className="mt-2 text-3xl font-black">Menu management</h1>
        </div>
        <button className="rounded-full bg-stone-950 px-5 py-3 text-sm font-black text-white">
          Add item
        </button>
      </div>
      <div className="mt-6 overflow-hidden rounded-lg bg-white shadow-sm">
        {fallbackFoods.map((item) => (
          <div key={item.id} className="grid gap-4 border-b border-stone-100 p-4 last:border-0 sm:grid-cols-[1fr_120px_120px] sm:items-center">
            <div>
              <p className="font-black">{item.name}</p>
              <p className="text-sm text-stone-500">{item.category.name}</p>
            </div>
            <p className="font-black">Rs {item.finalPrice}</p>
            <span className="w-fit rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-700">
              Available
            </span>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
