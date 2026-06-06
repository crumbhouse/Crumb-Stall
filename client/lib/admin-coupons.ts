export type CouponType = "PERCENTAGE" | "FIXED";

export type AdminCoupon = {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minimumAmount: number;
  startsAt: string;
  endsAt: string;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CouponInput = {
  code: string;
  type: CouponType;
  value: number;
  minimumAmount: number;
  startsAt: string;
  endsAt: string;
  usageLimit?: number | null;
  isActive?: boolean;
};

export async function createAdminCoupon(input: CouponInput) {
  const response = await fetch("/api/admin/coupons", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Coupon creation failed"));
  }

  return (await response.json()) as AdminCoupon;
}

export async function updateAdminCoupon(couponId: string, input: CouponInput) {
  const response = await fetch(`/api/admin/coupons/${encodeURIComponent(couponId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Coupon update failed"));
  }

  return (await response.json()) as AdminCoupon;
}

export async function deactivateAdminCoupon(couponId: string) {
  const response = await fetch(`/api/admin/coupons/${encodeURIComponent(couponId)}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Coupon deactivation failed"));
  }

  return (await response.json()) as AdminCoupon;
}

async function readErrorMessage(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as { message?: string };

    return typeof payload.message === "string" ? payload.message : fallback;
  } catch {
    return fallback;
  }
}
