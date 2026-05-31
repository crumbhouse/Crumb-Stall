import Link from "next/link";
import type { ReactNode } from "react";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/menu", label: "Menu" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/analytics", label: "Analytics" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-stone-100 text-stone-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-stone-200 bg-white p-5 lg:block">
        <Link href="/admin" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-stone-950 text-sm font-black text-white">
            CS
          </span>
          <div>
            <p className="font-black">Crumb Stall</p>
            <p className="text-xs font-semibold text-stone-500">Admin</p>
          </div>
        </Link>
        <nav className="mt-8 space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-lg px-4 py-3 text-sm font-bold text-stone-600 hover:bg-stone-100 hover:text-stone-950"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <section className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </section>
    </main>
  );
}
