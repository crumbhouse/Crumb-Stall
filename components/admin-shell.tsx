import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type { ReactNode } from "react";
import { authOptions } from "@/lib/auth-options";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

const links = [
  { href: "/admin", label: "Dashboard", icon: "D" },
  { href: "/admin/menu", label: "Menu", icon: "M" },
  { href: "/admin/orders", label: "Orders", icon: "O" },
  { href: "/admin/coupons", label: "Coupons", icon: "%" },
  { href: "/admin/reviews", label: "Reviews", icon: "R" },
  { href: "/admin/customers", label: "Customers", icon: "C" },
  { href: "/admin/analytics", label: "Analytics", icon: "A" },
  { href: "/admin/reports", label: "Reports", icon: "RP" },
];

const superAdminLinks = [{ href: "/admin/approvals", label: "Approvals", icon: "OK" }];

export async function AdminShell({ children }: { children: ReactNode }) {
  const bypassAuthForE2E =
    process.env.NODE_ENV !== "production" &&
    (await cookies()).get("crumbstall-e2e-auth-bypass")?.value === "true";
  const session = bypassAuthForE2E
    ? {
        user: {
          email: "admin.e2e@crumbstall.test",
          role: "ADMIN",
        },
      }
    : await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/admin/login?callbackUrl=/admin");
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    redirect("/admin/login?callbackUrl=/admin");
  }

  const hasAdminAccess = bypassAuthForE2E || (await verifyAdminAccess(session.user.email));

  if (!hasAdminAccess) {
    redirect("/admin/login?callbackUrl=/admin&error=AccessDenied");
  }

  const visibleLinks =
    session.user.role === "SUPER_ADMIN" ? [...links, ...superAdminLinks] : links;

  return (
    <main className="min-h-screen bg-[#f4f1ec] pb-24 text-[#191714] lg:pb-0">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-[#ded6cb] bg-[#171512] p-5 text-white shadow-[18px_0_60px_rgba(42,32,19,0.12)] lg:block">
        <Link href="/admin" className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-lg bg-[#f6c453] text-sm font-black text-[#171512]">
            CS
          </span>
          <div>
            <p className="font-black">Crumb Stall</p>
            <p className="text-xs font-semibold text-white/55">Admin command center</p>
          </div>
        </Link>
        <nav className="mt-8 space-y-1">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold text-white/68 transition hover:bg-white/10 hover:text-white"
            >
              <span className="flex size-7 items-center justify-center rounded-md bg-white/8 text-xs text-[#f6c453]">
                {link.icon}
              </span>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="absolute inset-x-5 bottom-5 rounded-lg border border-white/10 bg-white/8 p-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#f6c453]">
            Signed in
          </p>
          <p className="mt-2 truncate text-sm font-bold text-white/80">{session.user.email}</p>
        </div>
      </aside>

      <header className="sticky top-0 z-40 border-b border-[#ded6cb] bg-[#fdfbf7]/95 backdrop-blur lg:hidden">
        <div className="flex h-16 items-center justify-between gap-3 px-4">
          <Link href="/admin" className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#171512] text-sm font-black text-white">
              CS
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-black">Crumb Stall Admin</p>
              <p className="truncate text-xs font-semibold text-[#756b5e]">{session.user.email}</p>
            </div>
          </Link>
          <Link
            href="/admin/orders"
            className="rounded-md bg-[#171512] px-3 py-2 text-xs font-black text-white"
          >
            Orders
          </Link>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-4 pb-3">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="shrink-0 rounded-full border border-[#e4ddd2] bg-white px-4 py-2 text-xs font-black text-[#51483d]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      <section className="lg:pl-72">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </section>

      <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-[#ded6cb] bg-[#fdfbf7]/96 px-2 py-2 shadow-[0_-16px_40px_rgba(42,32,19,0.14)] backdrop-blur lg:hidden">
        {visibleLinks.slice(0, 5).map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[11px] font-black text-[#5b5146] transition hover:bg-[#efe8de]"
          >
            <span className="text-sm text-[#9d5b21]">{link.icon}</span>
            <span className="max-w-full truncate">{link.label}</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}

async function verifyAdminAccess(email: string) {
  try {
    const response = await fetch(`${apiUrl}/admin/me`, {
      headers: {
        "x-customer-email": email,
        ...(process.env.AUTH_SYNC_SECRET
          ? { "x-auth-sync-secret": process.env.AUTH_SYNC_SECRET }
          : {}),
      },
      cache: "no-store",
    });

    return response.ok;
  } catch {
    return false;
  }
}
