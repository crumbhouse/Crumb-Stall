import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-stone-50 px-4 text-stone-950">
      <section className="w-full max-w-md rounded-lg bg-white p-6 shadow-sm">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-600">Crumb Stall</p>
        <h1 className="mt-2 text-3xl font-black">Login to continue</h1>
        <p className="mt-3 text-sm leading-6 text-stone-500">
          Google OAuth will connect here. For now, continue to the menu preview.
        </p>
        <button className="mt-6 w-full rounded-full border border-stone-200 px-5 py-3 font-black">
          Continue with Google
        </button>
        <Link href="/menu" className="mt-3 flex justify-center rounded-full bg-orange-600 px-5 py-3 font-black text-white">
          Continue as guest
        </Link>
      </section>
    </main>
  );
}
