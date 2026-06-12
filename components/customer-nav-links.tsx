"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

type NavLink = {
  href: string;
  label: string;
};

export function CustomerNavLinks({ links }: { links: NavLink[] }) {
  const { status } = useSession();
  const visibleLinks =
    status === "authenticated" ? links : links.filter((link) => link.href === "/menu");

  return (
    <nav className="hidden items-center gap-1 md:flex">
      {visibleLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-full px-4 py-2 text-sm font-bold text-[#4b4b4b] transition hover:bg-[#fff0f2] hover:text-[#d21f32]"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
