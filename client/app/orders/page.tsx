import Link from "next/link";
import { CustomerNav } from "@/components/customer-nav";
import { MobileBar } from "@/components/mobile-bar";

const orders = [
  { id: "CS-1001", status: "Ready for pickup", total: 226, time: "Today, 1:20 PM" },
  { id: "CS-0994", status: "Completed", total: 139, time: "Yesterday, 4:05 PM" },
];

export default function OrdersPage() {
  return (
    <main className="min-h-screen bg-stone-50 pb-20 text-stone-950">
      <CustomerNav />
      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-black">Orders</h1>
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`} className="block rounded-lg border border-orange-100 bg-white p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-black">{order.id}</p>
                  <p className="mt-1 text-sm text-stone-500">{order.time}</p>
                </div>
                <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-black text-orange-700">{order.status}</span>
              </div>
              <p className="mt-4 font-black">Rs {order.total}</p>
            </Link>
          ))}
        </div>
      </section>
      <MobileBar />
    </main>
  );
}
