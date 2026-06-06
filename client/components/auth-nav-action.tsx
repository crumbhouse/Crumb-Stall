"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export function AuthNavAction() {
  const { data: session, status } = useSession();
  const avatarUrl = session?.user?.image ?? null;
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);
  const initials = getInitials(session?.user?.name ?? session?.user?.email);

  if (status === "loading") {
    return (
      <span
        className="inline-flex h-10 min-w-16 items-center justify-center rounded-full bg-[#171717] px-3 text-sm font-bold text-white opacity-70 sm:min-w-20 sm:px-4"
        aria-label="Loading session"
      >
        Login
      </span>
    );
  }

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="inline-flex h-10 items-center rounded-full bg-[#171717] px-3 text-sm font-bold text-white transition hover:bg-[#2b2b2b] sm:px-4"
      >
        Login
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {avatarUrl && failedAvatarUrl !== avatarUrl ? (
        // Google profile images are already tiny avatars; using img avoids dev-server
        // restarts when OAuth image hosts change.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt={session.user.name ?? "Crumb Stall customer"}
          referrerPolicy="no-referrer"
          decoding="async"
          onError={() => setFailedAvatarUrl(avatarUrl)}
          className="size-9 rounded-full object-cover"
        />
      ) : (
        <span className="flex size-9 items-center justify-center rounded-full bg-[#fff0f2] text-xs font-black text-[#e23744]">
          {initials}
        </span>
      )}
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/menu" })}
        className="hidden rounded-full border border-stone-200 px-4 py-2 text-sm font-bold text-[#171717] transition hover:bg-stone-50 sm:inline-flex"
      >
        Sign out
      </button>
    </div>
  );
}

function getInitials(value?: string | null) {
  if (!value) {
    return "CS";
  }

  const [first = "", second = ""] = value
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? "");

  return `${first}${second}` || "CS";
}
