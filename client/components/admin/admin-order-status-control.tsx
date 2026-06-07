"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateAdminOrderStatus } from "@/lib/admin-orders";

const labels: Record<string, string> = {
  PAID: "Placed",
  PLACED: "Placed",
  PREPARING: "Preparing",
  READY_FOR_PICKUP: "Ready for pickup",
  OTP_VERIFICATION_PENDING: "Ready / OTP pending",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const fallbackTransitions: Record<string, string[]> = {
  PAID: ["PREPARING", "CANCELLED"],
  PLACED: ["PREPARING", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY_FOR_PICKUP", "CANCELLED"],
  READY_FOR_PICKUP: ["CANCELLED"],
  OTP_VERIFICATION_PENDING: ["CANCELLED"],
};

export function AdminOrderStatusControl({
  orderNumber,
  currentStatus,
  allowedStatuses,
}: {
  orderNumber: string;
  currentStatus: string;
  allowedStatuses?: string[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const fallbackAllowedStatuses = fallbackTransitions[currentStatus] ?? [];
  const safeAllowedStatuses = Array.isArray(allowedStatuses) && allowedStatuses.length > 0
    ? allowedStatuses
    : fallbackAllowedStatuses;
  const statusOptions = safeAllowedStatuses.includes(currentStatus)
    ? safeAllowedStatuses
    : [currentStatus, ...safeAllowedStatuses];

  function updateStatus() {
    setMessage("");

    startTransition(async () => {
      try {
        await updateAdminOrderStatus(orderNumber, status);
        setMessage("Updated");
        router.refresh();
      } catch {
        setMessage("Update failed");
      }
    });
  }

  if (safeAllowedStatuses.length === 0) {
    return (
      <p className="rounded-md bg-stone-100 px-3 py-2 text-xs font-black text-stone-500">
        No manual status action
      </p>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
      <select
        value={status}
        onChange={(event) => setStatus(event.target.value)}
        className="min-w-0 rounded-md border border-stone-200 bg-white px-3 py-2 text-sm font-black outline-none focus:border-orange-600"
      >
        {statusOptions.map((option) => (
          <option key={option} value={option}>
            {labels[option] ?? option}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={updateStatus}
        disabled={isPending || status === currentStatus}
        className="rounded-md bg-[#171512] px-4 py-2 text-sm font-black text-white disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Update"}
      </button>
      {message ? (
        <span className="text-xs font-black text-orange-700 sm:col-span-2">{message}</span>
      ) : null}
    </div>
  );
}
