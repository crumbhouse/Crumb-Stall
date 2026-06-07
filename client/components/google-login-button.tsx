"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export function GoogleLoginButton({ callbackUrl = "/menu" }: { callbackUrl?: string }) {
  const [isRedirecting, setIsRedirecting] = useState(false);

  async function handleGoogleLogin() {
    if (isRedirecting) {
      return;
    }

    setIsRedirecting(true);

    const fallbackTimer = window.setTimeout(() => {
      window.location.href = `/api/auth/signin/google?callbackUrl=${encodeURIComponent(
        callbackUrl,
      )}`;
    }, 1200);

    try {
      await signIn("google", { callbackUrl });
    } catch {
      window.clearTimeout(fallbackTimer);
      window.location.href = `/api/auth/signin/google?callbackUrl=${encodeURIComponent(
        callbackUrl,
      )}`;
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleGoogleLogin()}
      disabled={isRedirecting}
      className="mt-6 flex w-full items-center justify-center gap-3 rounded-full border border-stone-200 bg-white px-5 py-3 font-black text-stone-950 shadow-sm transition hover:border-[#d21f32] hover:bg-[#fff7f7] disabled:cursor-wait disabled:opacity-70"
    >
      <span className="flex size-6 items-center justify-center rounded-full bg-[#4285f4] text-xs font-black text-white">
        G
      </span>
      {isRedirecting ? "Redirecting..." : "Continue with Google"}
    </button>
  );
}
