"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import {
  createAdminCoupon,
  deactivateAdminCoupon,
  updateAdminCoupon,
  type AdminCoupon,
  type CouponInput,
  type CouponType,
} from "@/lib/admin-coupons";

export function CouponManager({ coupons }: { coupons: AdminCoupon[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function createCoupon(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const form = event.currentTarget;
    const input = readCouponForm(new FormData(form));

    startTransition(async () => {
      try {
        await createAdminCoupon(input);
        form.reset();
        setMessage("Coupon created");
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Coupon creation failed");
      }
    });
  }

  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
      <section className="h-fit rounded-lg bg-white p-5 shadow-sm">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-600">
          New coupon
        </p>
        <h2 className="mt-2 text-2xl font-black">Create offer</h2>
        <form onSubmit={createCoupon} className="mt-5 space-y-4">
          <CouponFields />
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-md bg-stone-950 px-5 py-3 text-sm font-black text-white disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Create coupon"}
          </button>
          {message ? <p className="text-sm font-black text-orange-700">{message}</p> : null}
        </form>
      </section>

      <section className="overflow-hidden rounded-lg bg-white shadow-sm">
        <div className="border-b border-stone-100 p-5">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-600">
            Coupons
          </p>
          <h2 className="mt-2 text-2xl font-black">Live offers</h2>
        </div>
        {coupons.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-xl font-black">No coupons yet</p>
            <p className="mt-2 text-sm font-semibold text-stone-500">
              Create the first offer to make it available during checkout.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {coupons.map((coupon) => (
              <CouponRow key={coupon.id} coupon={coupon} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function CouponRow({ coupon }: { coupon: AdminCoupon }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function updateCoupon(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const input = readCouponForm(new FormData(event.currentTarget), {
      includeActive: true,
    });

    startTransition(async () => {
      try {
        await updateAdminCoupon(coupon.id, input);
        setMessage("Saved");
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Coupon update failed");
      }
    });
  }

  function deactivateCoupon() {
    setMessage("");

    startTransition(async () => {
      try {
        await deactivateAdminCoupon(coupon.id);
        setMessage("Deactivated");
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Coupon deactivation failed");
      }
    });
  }

  return (
    <form onSubmit={updateCoupon} className="grid gap-4 p-5">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-2xl font-black">{coupon.code}</p>
            <span
              className={`w-fit rounded-full px-3 py-1 text-xs font-black ${
                coupon.isActive
                  ? "bg-green-50 text-green-700"
                  : "bg-stone-100 text-stone-500"
              }`}
            >
              {coupon.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <p className="mt-1 text-sm font-semibold text-stone-500">
            {formatCouponValue(coupon)} · min Rs {coupon.minimumAmount} · used{" "}
            {coupon.usedCount}
            {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
          </p>
        </div>
        <p className="rounded-md bg-orange-50 px-3 py-2 text-xs font-black text-orange-700">
          {formatDate(coupon.startsAt)} to {formatDate(coupon.endsAt)}
        </p>
      </div>

      <CouponFields coupon={coupon} showActive />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-stone-950 px-4 py-2 text-sm font-black text-white disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={deactivateCoupon}
          disabled={isPending || !coupon.isActive}
          className="rounded-md bg-stone-100 px-4 py-2 text-sm font-black text-stone-700 disabled:opacity-50"
        >
          Deactivate
        </button>
        {message ? <span className="text-xs font-black text-orange-700">{message}</span> : null}
      </div>
    </form>
  );
}

function CouponFields({
  coupon,
  showActive = false,
}: {
  coupon?: AdminCoupon;
  showActive?: boolean;
}) {
  return (
    <div className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-black">
          Code
          <input
            name="code"
            required
            defaultValue={coupon?.code}
            placeholder="COUPONCODE"
            className="rounded-md border border-stone-200 px-3 py-2 font-semibold uppercase outline-none focus:border-orange-600"
          />
        </label>
        <label className="grid gap-1 text-sm font-black">
          Type
          <select
            name="type"
            defaultValue={coupon?.type ?? "PERCENTAGE"}
            className="rounded-md border border-stone-200 px-3 py-2 font-semibold outline-none focus:border-orange-600"
          >
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED">Fixed amount</option>
          </select>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="grid gap-1 text-sm font-black">
          Value
          <input
            name="value"
            type="number"
            min="0"
            step="0.01"
            required
            defaultValue={coupon?.value ?? 10}
            className="rounded-md border border-stone-200 px-3 py-2 font-semibold outline-none focus:border-orange-600"
          />
        </label>
        <label className="grid gap-1 text-sm font-black">
          Minimum cart
          <input
            name="minimumAmount"
            type="number"
            min="0"
            step="0.01"
            required
            defaultValue={coupon?.minimumAmount ?? 0}
            className="rounded-md border border-stone-200 px-3 py-2 font-semibold outline-none focus:border-orange-600"
          />
        </label>
        <label className="grid gap-1 text-sm font-black">
          Usage limit
          <input
            name="usageLimit"
            type="number"
            min="1"
            defaultValue={coupon?.usageLimit ?? ""}
            placeholder="Unlimited"
            className="rounded-md border border-stone-200 px-3 py-2 font-semibold outline-none focus:border-orange-600"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-black">
          Starts at
          <input
            name="startsAt"
            type="datetime-local"
            required
            defaultValue={toDateTimeLocal(coupon?.startsAt) ?? ""}
            className="rounded-md border border-stone-200 px-3 py-2 font-semibold outline-none focus:border-orange-600"
          />
        </label>
        <label className="grid gap-1 text-sm font-black">
          Ends at
          <input
            name="endsAt"
            type="datetime-local"
            required
            defaultValue={toDateTimeLocal(coupon?.endsAt) ?? ""}
            className="rounded-md border border-stone-200 px-3 py-2 font-semibold outline-none focus:border-orange-600"
          />
        </label>
      </div>

      {showActive ? (
        <label className="flex items-center gap-2 rounded-md border border-stone-200 px-3 py-2 text-sm font-black">
          <input
            name="isActive"
            type="checkbox"
            defaultChecked={coupon?.isActive}
            className="size-4 accent-orange-600"
          />
          Active
        </label>
      ) : null}
    </div>
  );
}

function readCouponForm(
  formData: FormData,
  options: { includeActive?: boolean } = {},
): CouponInput {
  return {
    code: readString(formData, "code").toUpperCase(),
    type: readCouponType(formData.get("type")),
    value: readNumber(formData, "value"),
    minimumAmount: readNumber(formData, "minimumAmount"),
    startsAt: readDateTimeLocal(formData, "startsAt"),
    endsAt: readDateTimeLocal(formData, "endsAt"),
    usageLimit: readOptionalNumber(formData, "usageLimit"),
    ...(options.includeActive ? { isActive: formData.get("isActive") === "on" } : {}),
  };
}

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function readNumber(formData: FormData, key: string) {
  const value = Number(formData.get(key) ?? 0);

  return Number.isFinite(value) ? value : 0;
}

function readOptionalNumber(formData: FormData, key: string) {
  const rawValue = readString(formData, key);

  if (!rawValue) {
    return null;
  }

  const value = Number(rawValue);

  return Number.isFinite(value) ? value : null;
}

function readCouponType(value: FormDataEntryValue | null): CouponType {
  return value === "FIXED" ? "FIXED" : "PERCENTAGE";
}

function readDateTimeLocal(formData: FormData, key: string) {
  return new Date(readString(formData, key)).toISOString();
}

function toDateTimeLocal(value?: string) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 16);
}

function formatCouponValue(coupon: AdminCoupon) {
  return coupon.type === "PERCENTAGE" ? `${coupon.value}% off` : `Rs ${coupon.value} off`;
}

function formatDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");

  return [day, month, year].filter(Boolean).join("/");
}
