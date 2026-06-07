import { AdminLoginForm } from "@/components/admin/admin-login-form";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = sanitizeCallbackUrl(params.callbackUrl);

  return (
    <main className="min-h-screen bg-[#f6f6f4] px-4 py-8 text-stone-950 sm:px-6 lg:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-lg bg-white shadow-[0_24px_80px_rgba(23,23,23,0.12)] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col justify-between bg-stone-950 p-6 text-white sm:p-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-lg bg-[#d21f32] text-sm font-black">
                CS
              </span>
              <div>
                <p className="font-black">Crumb Stall</p>
                <p className="text-xs font-semibold text-white/55">Staff operations</p>
              </div>
            </div>
            <div className="mt-14 max-w-md">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-300">
                Staff access
              </p>
              <h1 className="mt-3 text-4xl font-black leading-tight">
                Manage orders without exposing admin tools to customers.
              </h1>
              <p className="mt-4 text-sm font-semibold leading-6 text-white/65">
                Admin accounts use credentials and super-admin approval. Customer Google login stays
                separate from this workspace.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-3 text-sm font-semibold text-white/70 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="font-black text-white">1. Request</p>
              <p className="mt-1">Staff submits access details.</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="font-black text-white">2. Approve</p>
              <p className="mt-1">Super admin reviews the request.</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="font-black text-white">3. Operate</p>
              <p className="mt-1">Approved admins manage orders and handovers.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center p-5 sm:p-8 lg:p-12">
          <div className="w-full">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#d21f32]">
              Admin portal
            </p>
            <h2 className="mt-2 text-3xl font-black">Sign in or request access</h2>
            <p className="mt-3 max-w-lg text-sm font-semibold leading-6 text-stone-500">
              Use your approved admin credentials. If you are new staff, submit a request and wait
              for approval from the super admin.
            </p>
            <AdminLoginForm callbackUrl={callbackUrl} error={params.error} />
          </div>
        </div>
      </section>
    </main>
  );
}

function sanitizeCallbackUrl(callbackUrl: string | undefined) {
  if (!callbackUrl || callbackUrl.startsWith("http://") || callbackUrl.startsWith("https://")) {
    return "/admin";
  }

  return callbackUrl.startsWith("/admin") ? callbackUrl : "/admin";
}
