import Link from "next/link";
import { CounterOrderForm } from "@/components/admin/counter-order-form";
import { AdminShell } from "@/components/admin-shell";
import { getAdminFoods } from "@/lib/admin-foods-server";

export const runtime = "nodejs";

export default async function CreateCounterOrderPage() {
  const foods = await getAdminFoods();

  return (
    <AdminShell>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-600">
            Counter order
          </p>
          <h1 className="mt-2 text-3xl font-black">Create order for customer</h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold text-stone-500">
            Use this when a customer cannot order from their phone. Counter customers are tracked
            by phone number; email is optional.
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="w-fit rounded-md border border-stone-200 bg-white px-5 py-3 text-sm font-black text-stone-800"
        >
          Back to orders
        </Link>
      </div>
      <CounterOrderForm foods={foods} />
    </AdminShell>
  );
}
