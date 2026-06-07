"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export function MobileBar() {
  const { status } = useSession();
  const pathname = usePathname();
  const items =
    status === "authenticated"
      ? [
          { href: "/menu", label: "Menu", icon: "M" },
          { href: "/favorites", label: "Saved", icon: "S" },
          { href: "/orders", label: "Orders", icon: "O" },
          { href: "/cart", label: "Cart", icon: "C" },
        ]
      : [
          { href: "/menu", label: "Menu", icon: "M" },
          { href: "/login?callbackUrl=/menu", label: "Login", icon: "IN" },
        ];

  return (
    <nav
      className={`fixed inset-x-0 bottom-0 z-40 grid border-t border-[#e8e8e3] bg-white/96 px-2 py-2 shadow-[0_-14px_34px_rgba(30,20,10,0.12)] backdrop-blur md:hidden ${
        status === "authenticated" ? "grid-cols-4" : "grid-cols-2"
      }`}
    >
      {items.map((item) => {
        const itemPath = item.href.split("?")[0];
        const isActive = pathname === itemPath || pathname.startsWith(`${itemPath}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-center text-[11px] font-black transition ${
              isActive
                ? "bg-[#fff0f2] text-[#e23744]"
                : "text-[#555] hover:bg-[#fff0f2] hover:text-[#e23744]"
            }`}
          >
            <span
              className={`flex size-6 items-center justify-center rounded-md text-[10px] ${
                isActive ? "bg-[#e23744] text-white" : "bg-[#f2f2ee] text-[#777]"
              }`}
            >
              {item.icon}
            </span>
            <span className="max-w-full truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
