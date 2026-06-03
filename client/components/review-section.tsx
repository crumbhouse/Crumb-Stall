"use client";

import { useState, useTransition } from "react";
import { submitFoodReview, type FoodReviews } from "@/lib/reviews";

export function ReviewSection({
  slug,
  initialReviews,
}: {
  slug: string;
  initialReviews: FoodReviews;
}) {
  const [reviews, setReviews] = useState(initialReviews);
  const [rating, setRating] = useState(initialReviews.myReview?.rating ?? 5);
  const [comment, setComment] = useState(initialReviews.myReview?.comment ?? "");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function submitReview() {
    setMessage("");

    startTransition(async () => {
      try {
        const updatedReviews = await submitFoodReview({ slug, rating, comment });
        setReviews(updatedReviews);
        setMessage("Review saved. Thanks for the signal.");
      } catch {
        setMessage("Only purchased items can be reviewed.");
      }
    });
  }

  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
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
              <p className="font-black">
                {reviews.myReview ? "Update your review" : "Review your purchase"}
              </p>
              <div className="mt-3 flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className={`size-10 rounded-md text-lg font-black ${
                      rating >= value
                        ? "bg-[#e23744] text-white"
                        : "bg-white text-[#8b8b8b]"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <label htmlFor="review-comment" className="sr-only">
                Review comment
              </label>
              <textarea
                id="review-comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                maxLength={500}
                className="mt-3 min-h-24 w-full rounded-md border border-[#e8e8e3] bg-white p-3 text-sm font-semibold outline-none focus:border-[#e23744]"
                placeholder="What should other students know about this item?"
              />
              <button
                type="button"
                onClick={submitReview}
                disabled={isPending}
                className="mt-3 rounded-md bg-[#171717] px-5 py-3 text-sm font-black text-white disabled:opacity-60"
              >
                {isPending ? "Saving..." : "Save review"}
              </button>
            </div>
          ) : (
            <div>
              <p className="font-black">Buy it first, then review it.</p>
              <p className="mt-1 text-sm font-semibold text-[#646464]">
                Reviews are only open for items found in your paid order history.
              </p>
            </div>
          )}
          {message ? <p className="mt-3 text-sm font-black text-[#e23744]">{message}</p> : null}
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
