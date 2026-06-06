"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateAdminOrderStatus } from "@/lib/admin-orders";

const labels: Record<string, string> = {
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  READY_FOR_PICKUP: "Ready for pickup",
  OTP_VERIFICATION_PENDING: "Ready / OTP pending",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function AdminOrderStatusControl({
  orderNumber,
  currentStatus,
  allowedStatuses,
}: {
  orderNumber: string;
  currentStatus: string;
  allowedStatuses: string[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const statusOptions = allowedStatuses.includes(currentStatus)
    ? allowedStatuses
    : [currentStatus, ...allowedStatuses];

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

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <select
        value={status}
        onChange={(event) => setStatus(event.target.value)}
        className="rounded-md border border-stone-200 px-3 py-2 text-sm font-black outline-none focus:border-orange-600"
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
        className="rounded-md bg-stone-950 px-4 py-2 text-sm font-black text-white disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Update"}
      </button>
      {message ? <span className="text-xs font-black text-orange-700">{message}</span> : null}
    </div>
  );
}
