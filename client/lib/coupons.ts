export type ValidatedCoupon = {
  code: string;
  label: string;
  type: "percentage" | "fixed";
  value: number;
  minimumAmount: number;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export async function validateCoupon(code: string, subtotal: number) {
  const response = await fetch(`${apiUrl}/coupons/validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code, subtotal }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getErrorMessage(payload));
  }

  const coupon = payload.coupon as {
    code: string;
    type: "PERCENTAGE" | "FIXED_AMOUNT";
    value: number;
    minimumAmount: number;
  };

  return {
    code: coupon.code,
    label:
      coupon.type === "PERCENTAGE"
        ? `${coupon.value}% off on orders above Rs ${coupon.minimumAmount}`
        : `Rs ${coupon.value} off on orders above Rs ${coupon.minimumAmount}`,
    type: coupon.type === "PERCENTAGE" ? "percentage" : "fixed",
    value: coupon.value,
    minimumAmount: coupon.minimumAmount,
  } satisfies ValidatedCoupon;
}

function getErrorMessage(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return "Coupon validation failed.";
  }

  const message = (payload as { message?: unknown }).message;

  if (Array.isArray(message)) {
    return message.join(" ");
  }

  return typeof message === "string" ? message : "Coupon validation failed.";
}
