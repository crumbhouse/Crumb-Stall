import Link from "next/link";
import { CustomerNav } from "@/components/customer-nav";

export default async function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;

  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <CustomerNav />
      <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-600">Order tracking</p>
        <h1 className="mt-2 text-3xl font-black">{orderId}</h1>
        <div className="mt-6 rounded-lg border border-orange-100 bg-white p-5">
          {["Placed", "Confirmed", "Preparing", "Ready for pickup"].map((step, index) => (
            <div key={step} className="flex gap-4 pb-5 last:pb-0">
              <span className="mt-1 size-4 rounded-full bg-orange-600" />
              <div>
                <p className="font-black">{step}</p>
                <p className="text-sm text-stone-500">{index === 3 ? "Show OTP 482913 at counter" : "Done"}</p>
              </div>
            </div>
          ))}
        </div>
        <Link href="/invoices/INV-CS-1001" className="mt-6 inline-flex rounded-full bg-stone-950 px-5 py-3 font-black text-white">
          View invoice
        </Link>
      </section>
    </main>
  );
}
