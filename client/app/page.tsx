const highlights = [
  "Google login",
  "Live order tracking",
  "Pickup OTP",
  "Invoices",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fff8f1] text-[#24140f]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-[#ff5a1f] text-lg font-black text-white">
              CS
            </span>
            <div>
              <p className="text-lg font-bold">Crumb Stall</p>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8d5d45]">
                Campus eats
              </p>
            </div>
          </div>
          <a
            href="#phase-0"
            className="rounded-full bg-[#24140f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3a2118]"
          >
            View setup
          </a>
        </header>

        <div className="grid flex-1 items-center gap-10 py-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#b44819] shadow-sm">
              Phase 0 foundation is taking shape
            </p>
            <h1 className="text-5xl font-black tracking-tight sm:text-6xl">
              Fast food ordering for one very busy stall.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#6f4b3d]">
              Crumb Stall will bring catalog browsing, cart checkout, Razorpay payments, pickup
              OTPs, invoices, and admin controls into one mobile-first product.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {highlights.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[#f2c7ad] bg-white px-4 py-2 text-sm font-semibold text-[#5d3425]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div
            id="phase-0"
            className="rounded-lg border border-[#f0cfbc] bg-white p-6 shadow-[0_24px_70px_rgba(123,63,28,0.16)]"
          >
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#ff5a1f]">
              Foundation checklist
            </p>
            <div className="mt-6 space-y-4">
              {[
                "NestJS API module map",
                "Prisma schema and seed data",
                "PostgreSQL and Redis Docker services",
                "Environment templates",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-lg bg-[#fff8f1] p-4">
                  <span className="size-3 rounded-full bg-[#22c55e]" />
                  <span className="font-semibold">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
