import { ReviewModerationPanel } from "@/components/admin/review-moderation-panel";
import { AdminShell } from "@/components/admin-shell";
import { getAdminReviews } from "@/lib/admin-reviews-server";

export default async function AdminReviewsPage() {
  const reviews = await getAdminReviews();

  return (
    <AdminShell>
      <div>
        <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-600">
          Trust and quality
        </p>
        <h1 className="mt-2 text-3xl font-black">Review moderation</h1>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-stone-500">
          Hide inappropriate or low-quality reviews from customer food pages without deleting the
          original customer feedback.
        </p>
      </div>
      <ReviewModerationPanel reviews={reviews} />
    </AdminShell>
  );
}
