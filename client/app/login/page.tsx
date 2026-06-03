import Link from "next/link";
import { GoogleLoginButton } from "@/components/google-login-button";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f8f6f1] px-4 text-stone-950">
      <section className="w-full max-w-md rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_24px_80px_rgba(23,23,23,0.10)]">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-600">Crumb Stall</p>
        <h1 className="mt-2 text-3xl font-black">Login to save your orders</h1>
        <p className="mt-3 text-sm leading-6 text-stone-500">
          Use Google to keep favorites, cart, orders, and invoices tied to your account.
        </p>
        <GoogleLoginButton />
        <Link href="/menu" className="mt-3 flex justify-center rounded-full bg-orange-600 px-5 py-3 font-black text-white">
          Continue as guest
        </Link>
      </section>
    </main>
  );
}
