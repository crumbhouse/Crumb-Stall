import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f6f4] px-4 text-[#171717]">
      <section className="w-full max-w-lg rounded-lg border border-[#e8e8e3] bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-[#d21f32]">404</p>
        <h1 className="mt-2 text-3xl font-black">Page not found</h1>
        <p className="mt-3 text-sm font-semibold leading-6 text-[#646464]">
          The page you are looking for does not exist or has moved.
        </p>
        <Link
          href="/menu"
          className="mt-6 inline-flex rounded-md bg-[#d21f32] px-5 py-3 font-black text-white"
        >
          Back to menu
        </Link>
      </section>
    </main>
  );
}
