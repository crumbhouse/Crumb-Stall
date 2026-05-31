import { CustomerNav } from "@/components/customer-nav";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ invoiceNumber: string }>;
}) {
  const { invoiceNumber } = await params;

  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <CustomerNav />
      <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="rounded-lg bg-white p-8 shadow-sm">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-600">Invoice</p>
          <h1 className="mt-2 text-3xl font-black">{invoiceNumber}</h1>
          <div className="mt-8 space-y-3 text-sm">
            <div className="flex justify-between"><span>Classic Veg Burger</span><span>Rs 79</span></div>
            <div className="flex justify-between"><span>Cold Coffee</span><span>Rs 79</span></div>
            <div className="flex justify-between border-t border-stone-200 pt-3 font-black"><span>Total paid</span><span>Rs 166</span></div>
          </div>
          <button className="mt-8 rounded-full bg-orange-600 px-5 py-3 font-black text-white">Download PDF</button>
        </div>
      </section>
    </main>
  );
}
