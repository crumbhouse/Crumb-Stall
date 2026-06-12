"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { submitOrderRating } from "@/lib/reviews";

export function OrderRatingPanel({
  orderNumber,
  initialRating,
  itemCount,
}: {
  orderNumber: string;
  initialRating: number | null;
  itemCount: number;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(initialRating ?? 0);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function saveRating(nextRating: number) {
    setRating(nextRating);
    setMessage("");

    startTransition(async () => {
      try {
        const result = await submitOrderRating({
          orderNumber,
          rating: nextRating,
        });

        setMessage(
          `Saved ${result.rating} star${result.rating === 1 ? "" : "s"} for ${result.reviewedItemCount} item${
            result.reviewedItemCount === 1 ? "" : "s"
          }.`,
        );
        router.refresh();
      } catch {
        setMessage("Rating could not be saved.");
      }
    });
  }

  return (
    <section className="mt-6 rounded-lg border border-[#e8e8e3] bg-white p-5 shadow-sm">
      <p className="text-sm font-black uppercase tracking-[0.16em] text-[#d21f32]">
        Rate this order
      </p>
      <h2 className="mt-2 text-2xl font-black">How was your food?</h2>
      <p className="mt-1 text-sm font-semibold text-[#646464]">
        One rating applies to all {itemCount} item{itemCount === 1 ? "" : "s"} in this order.
      </p>
      <div className="mt-4 flex gap-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => saveRating(value)}
            disabled={isPending}
            aria-label={`Rate ${value} star${value === 1 ? "" : "s"}`}
            className={`size-11 rounded-md text-xl font-black transition disabled:opacity-60 ${
              rating >= value ? "bg-[#d21f32] text-white" : "bg-[#f1f1ee] text-[#666666]"
            }`}
          >
            ★
          </button>
        ))}
      </div>
      {message ? <p className="mt-3 text-sm font-black text-[#d21f32]">{message}</p> : null}
    </section>
  );
}
