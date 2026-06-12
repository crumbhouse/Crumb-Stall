import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f6f4] px-4 text-[#171717]">
      <section className="w-full max-w-lg rounded-lg border border-[#e8e8e3] bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-[#d21f32]">401</p>
        <h1 className="mt-2 text-3xl font-black">Login required</h1>
        <p className="mt-3 text-sm font-semibold leading-6 text-[#646464]">
          This page contains your private order, invoice, checkout, or saved-item data. Please login
          before opening it.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/login?callbackUrl=/menu"
            className="rounded-md bg-[#d21f32] px-5 py-3 font-black text-white"
          >
            Login
          </Link>
          <Link
            href="/menu"
            className="rounded-md border border-[#e8e8e3] px-5 py-3 font-black text-[#171717]"
          >
            Back to menu
          </Link>
        </div>
      </section>
    </main>
  );
}
