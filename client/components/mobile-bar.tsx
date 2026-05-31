import Link from "next/link";

export function MobileBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-[#e8e8e3] bg-white px-2 py-2 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] md:hidden">
      {[
        { href: "/menu", label: "Menu" },
        { href: "/favorites", label: "Saved" },
        { href: "/orders", label: "Orders" },
        { href: "/cart", label: "Cart" },
      ].map((item) => (
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
