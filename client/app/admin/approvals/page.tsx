import { AdminShell } from "@/components/admin-shell";
import { AdminApprovalsPanel } from "@/components/admin/admin-approvals-panel";

export default function AdminApprovalsPage() {
  return (
    <AdminShell>
      <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-600">
        Super admin
      </p>
      <h1 className="mt-2 text-3xl font-black">Admin approvals</h1>
      <p className="mt-2 max-w-2xl text-sm font-semibold text-stone-500">
        Approve staff access requests after verifying the requester. Approved admins can sign in to
        the admin area with credentials.
      </p>
      <AdminApprovalsPanel />
    </AdminShell>
  );
}
