"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export function MobileBar() {
  const { status } = useSession();
  const items =
    status === "authenticated"
      ? [
          { href: "/menu", label: "Menu" },
          { href: "/favorites", label: "Saved" },
          { href: "/orders", label: "Orders" },
          { href: "/cart", label: "Cart" },
        ]
      : [
          { href: "/menu", label: "Menu" },
          { href: "/login?callbackUrl=/menu", label: "Login" },
        ];

  return (
    <nav
      className={`fixed inset-x-0 bottom-0 z-40 grid border-t border-[#e8e8e3] bg-white px-2 py-2 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] md:hidden ${
        status === "authenticated" ? "grid-cols-4" : "grid-cols-2"
      }`}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rounded-lg px-2 py-2 text-center text-xs font-black text-[#555] transition hover:bg-[#fff0f2] hover:text-[#e23744]"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
