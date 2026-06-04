import { AdminLoginForm } from "@/components/admin/admin-login-form";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-stone-950 px-4 py-10 text-white">
      <section className="w-full max-w-md rounded-lg border border-white/10 bg-white p-6 text-stone-950 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-[#e23744]">
          Staff access
        </p>
        <h1 className="mt-2 text-3xl font-black">Admin sign in</h1>
        <p className="mt-3 text-sm font-semibold leading-6 text-stone-500">
          Admin accounts use approval-based credentials. Customer Google login does not grant admin
          access.
        </p>
        <AdminLoginForm callbackUrl={params.callbackUrl ?? "/admin"} error={params.error} />
      </section>
    </main>
  );
}
