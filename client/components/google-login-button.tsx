"use client";

import { signIn } from "next-auth/react";

export function GoogleLoginButton() {
  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl: "/menu" })}
      className="mt-6 flex w-full items-center justify-center gap-3 rounded-full border border-stone-200 bg-white px-5 py-3 font-black text-stone-950 shadow-sm transition hover:border-[#e23744] hover:bg-[#fff7f7]"
    >
      <span className="flex size-6 items-center justify-center rounded-full bg-[#4285f4] text-xs font-black text-white">
        G
      </span>
      Continue with Google
    </button>
  );
}
