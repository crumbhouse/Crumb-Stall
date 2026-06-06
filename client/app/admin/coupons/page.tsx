import { AdminShell } from "@/components/admin-shell";
import { CouponManager } from "@/components/admin/coupon-manager";
import { getAdminCoupons } from "@/lib/admin-coupons-server";

export default async function AdminCouponsPage() {
  const coupons = await getAdminCoupons();

  return (
    <AdminShell>
      <div>
        <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-600">Growth</p>
        <h1 className="mt-2 text-3xl font-black">Coupons</h1>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-stone-500">
          Create and manage checkout offers. Active coupons are available to customers only inside
          their configured validity window and usage limit.
        </p>
      </div>
      <CouponManager coupons={coupons} />
    </AdminShell>
  );
}
