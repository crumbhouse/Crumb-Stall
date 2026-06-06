"use client";

import Link from "next/link";
import type { FoodReviews } from "@/lib/reviews";

export function ReviewSection({
  initialReviews,
}: {
  initialReviews: FoodReviews;
}) {
  const reviews = initialReviews;

  return (
    <section id="reviews" className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-10 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-[#e8e8e3] bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#e23744]">
              Reviews
            </p>
            <h2 className="mt-1 text-2xl font-black">
              {reviews.summary.ratingAverage || "New"} rating
            </h2>
            <p className="mt-1 text-sm font-semibold text-[#646464]">
              {reviews.summary.ratingCount} verified customer review
              {reviews.summary.ratingCount === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-lg bg-[#f9f9f7] p-4">
          {reviews.canReview ? (
            <div>
              <p className="font-black">Rate from your order page.</p>
              <p className="mt-1 text-sm font-semibold text-[#646464]">
                Crumb Stall uses one star rating per order. That rating is applied to every item in
                the order.
              </p>
              <Link
                href="/orders"
                className="mt-3 inline-flex rounded-md bg-[#171717] px-5 py-3 text-sm font-black text-white"
              >
                Open orders
              </Link>
            </div>
          ) : (
            <div>
              <p className="font-black">Buy it first, then rate the order.</p>
              <p className="mt-1 text-sm font-semibold text-[#646464]">
                Star ratings are available on paid order detail pages.
              </p>
            </div>
          )}
        </div>

        <div className="mt-5 space-y-3">
          {reviews.data.length === 0 ? (
            <p className="rounded-lg border border-dashed border-[#d7d7cf] p-4 text-sm font-semibold text-[#646464]">
              No reviews yet. Your review can be the first once you purchase this item.
            </p>
          ) : (
            reviews.data.map((review) => (
              <article key={review.id} className="rounded-lg border border-[#eeeeea] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-black">{review.user.name}</p>
                  <span className="rounded-md bg-[#fff8db] px-2 py-1 text-sm font-black text-[#8a5a00]">
                    ★ {review.rating}
                  </span>
                </div>
                {review.comment ? (
                  <p className="mt-2 text-sm leading-6 text-[#646464]">{review.comment}</p>
                ) : null}
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
