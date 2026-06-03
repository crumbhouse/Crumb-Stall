import Link from "next/link";
import { AuthNavAction } from "@/components/auth-nav-action";

const links = [
  { href: "/menu", label: "Menu" },
  { href: "/orders", label: "Orders" },
  { href: "/favorites", label: "Saved" },
  { href: "/cart", label: "Cart" },
];

export function CustomerNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-[#e8e8e3] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/menu" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-[#e23744] text-base font-black text-white shadow-sm">
            CS
          </span>
          <div>
            <p className="text-base font-black text-[#171717]">Crumb Stall</p>
            <p className="text-xs font-semibold text-[#646464]">Scan. Order. Pickup.</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-bold text-[#4b4b4b] transition hover:bg-[#fff0f2] hover:text-[#e23744]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <AuthNavAction />
      </div>
    </header>
  );
}
