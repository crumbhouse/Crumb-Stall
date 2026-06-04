import Link from "next/link";
import { AuthNavAction } from "@/components/auth-nav-action";
import { NotificationPopover } from "@/components/notification-popover";
import { CustomerNavLinks } from "@/components/customer-nav-links";

const links = [
  { href: "/menu", label: "Menu" },
  { href: "/orders", label: "Orders" },
  { href: "/favorites", label: "Saved" },
  { href: "/cart", label: "Cart" },
];

export function CustomerNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-[#e8e8e3] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/menu" className="flex min-w-0 items-center gap-2 sm:gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#e23744] text-sm font-black text-white shadow-sm sm:size-10 sm:text-base">
            CS
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-[#171717] sm:text-base">Crumb Stall</p>
            <p className="hidden text-xs font-semibold text-[#646464] sm:block">
              Scan. Order. Pickup.
            </p>
          </div>
        </Link>

        <CustomerNavLinks links={links} />

        <div className="flex shrink-0 items-center gap-2">
          <NotificationPopover />
          <AuthNavAction />
        </div>
      </div>
    </header>
  );
}
