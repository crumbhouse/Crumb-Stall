"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { moderateAdminReview, type AdminReview } from "@/lib/admin-reviews";

export function ReviewModerationPanel({ reviews }: { reviews: AdminReview[] }) {
  const visibleReviews = reviews.filter((review) => !review.isHidden);
  const hiddenReviews = reviews.filter((review) => review.isHidden);

  return (
    <div className="mt-6 grid gap-6">
      <section className="grid gap-3 sm:grid-cols-3">
        <MetricCard label="Visible reviews" value={visibleReviews.length} />
        <MetricCard label="Hidden reviews" value={hiddenReviews.length} />
        <MetricCard label="Total reviews" value={reviews.length} />
      </section>

      <section className="overflow-hidden rounded-lg border border-[#e5ddd2] bg-white shadow-sm">
        <div className="border-b border-[#eee8df] p-5">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-600">
            Moderation queue
          </p>
          <h2 className="mt-2 text-2xl font-black">Latest reviews</h2>
        </div>
        {reviews.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-xl font-black">No reviews yet</p>
            <p className="mt-2 text-sm font-semibold text-stone-500">
              Customer reviews will appear here after purchased items are reviewed.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#eee8df]">
            {reviews.map((review) => (
              <ReviewRow key={review.id} review={review} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-lg border border-[#e5ddd2] bg-white p-5 shadow-sm">
      <p className="text-sm font-black uppercase tracking-[0.14em] text-stone-500">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </article>
  );
}

function ReviewRow({ review }: { review: AdminReview }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function toggleHidden() {
    setMessage("");

    startTransition(async () => {
      try {
        await moderateAdminReview(review.id, !review.isHidden);
        setMessage(review.isHidden ? "Review restored" : "Review hidden");
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Review moderation failed");
      }
    });
  }

  return (
    <article className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-start">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-[#fff8db] px-2 py-1 text-xs font-black text-[#8a5a00]">
            {renderStars(review.rating)} {review.rating}/5
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-black ${
              review.isHidden
                ? "bg-stone-100 text-stone-500"
                : "bg-green-50 text-green-700"
            }`}
          >
            {review.isHidden ? "Hidden" : "Visible"}
          </span>
          <span className="text-xs font-bold text-stone-500">{formatDate(review.createdAt)}</span>
        </div>

        <div className="mt-3 flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#171512] text-sm font-black text-white">
            {review.user.name.slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="text-lg font-black">{review.foodItem.name}</p>
            <p className="mt-1 truncate text-sm font-semibold text-stone-500">
              {review.user.name} · {review.user.email}
            </p>
          </div>
        </div>
        {review.comment ? (
          <p className="mt-3 rounded-lg bg-[#fbfaf7] p-4 text-sm font-semibold leading-6 text-stone-700">
            {review.comment}
          </p>
        ) : (
          <p className="mt-3 text-sm font-semibold text-stone-400">No written comment.</p>
        )}
      </div>

      <div className="rounded-lg border border-[#eee8df] bg-[#fbfaf7] p-3">
        <p className="mb-3 text-xs font-black uppercase tracking-[0.12em] text-stone-400">
          Moderation
        </p>
        <div className="flex flex-wrap gap-2 lg:justify-end">
        <Link
          href={`/food/${review.foodItem.slug}`}
          className="rounded-md border border-stone-200 bg-white px-4 py-2 text-sm font-black text-stone-700"
        >
          View item
        </Link>
        <button
          type="button"
          onClick={toggleHidden}
          disabled={isPending}
          className={`rounded-md px-4 py-2 text-sm font-black text-white disabled:opacity-50 ${
            review.isHidden ? "bg-green-700" : "bg-stone-950"
          }`}
        >
          {isPending ? "Saving..." : review.isHidden ? "Restore" : "Hide"}
        </button>
          {message ? (
            <p className="basis-full text-xs font-black text-orange-700 lg:text-right">{message}</p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function renderStars(rating: number) {
  return "★".repeat(Math.max(1, Math.min(5, rating)));
}

function formatDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");

  return [day, month, year].filter(Boolean).join("/");
}
