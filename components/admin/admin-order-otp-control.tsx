"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { generateAdminOrderOtp, verifyAdminOrderOtp } from "@/lib/admin-orders";

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
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Invalid OTP");
        router.refresh();
      }
    });
  }

  function regenerateOtp() {
    setMessage("");

    startTransition(async () => {
      try {
        await generateAdminOrderOtp(orderNumber);
        setOtp("");
        setMessage("New OTP sent to customer");
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "OTP generation failed");
      }
    });
  }

  return (
    <div className="mt-3 flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input
        value={otp}
        onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
        inputMode="numeric"
        placeholder="Enter pickup OTP"
        className="min-w-0 rounded-md border border-green-100 bg-white px-3 py-2 text-sm font-black outline-none focus:border-green-600"
      />
      <button
        type="button"
        onClick={verifyOtp}
        disabled={isPending || otp.length !== 6}
        className="rounded-md bg-green-700 px-4 py-2 text-sm font-black text-white disabled:opacity-50"
      >
        {isPending ? "Checking..." : "Verify"}
      </button>
      <button
        type="button"
        onClick={regenerateOtp}
        disabled={isPending}
        className="rounded-md bg-white px-4 py-2 text-sm font-black text-green-800 ring-1 ring-green-200 disabled:opacity-50"
      >
        Generate new OTP
      </button>
      </div>
      {message ? <span className="text-xs font-black text-green-800">{message}</span> : null}
    </div>
  );
}
