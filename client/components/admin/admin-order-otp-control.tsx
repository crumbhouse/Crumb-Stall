"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { verifyAdminOrderOtp } from "@/lib/admin-orders";

export function AdminOrderOtpControl({ orderNumber }: { orderNumber: string }) {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function verifyOtp() {
    setMessage("");

    startTransition(async () => {
      try {
        await verifyAdminOrderOtp(orderNumber, otp);
        setOtp("");
        setMessage("OTP verified");
        router.refresh();
      } catch {
        setMessage("Invalid OTP");
      }
    });
  }

  return (
    <div className="mt-3 flex flex-col gap-2 rounded-md bg-green-50 p-3 sm:flex-row sm:items-center">
      <input
        value={otp}
        onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
        inputMode="numeric"
        placeholder="Pickup OTP"
        className="min-w-0 rounded-md border border-green-100 px-3 py-2 text-sm font-black outline-none focus:border-green-600"
      />
      <button
        type="button"
        onClick={verifyOtp}
        disabled={isPending || otp.length !== 6}
        className="rounded-md bg-green-700 px-4 py-2 text-sm font-black text-white disabled:opacity-50"
      >
        {isPending ? "Checking..." : "Verify"}
      </button>
      {message ? <span className="text-xs font-black text-green-800">{message}</span> : null}
    </div>
  );
}
