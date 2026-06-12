import { GoogleLoginButton } from "@/components/google-login-button";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = sanitizeCallbackUrl(params.callbackUrl);

  return (
    <main className="grid min-h-screen place-items-center bg-[#f8f6f1] px-4 text-stone-950">
      <section className="w-full max-w-md rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_24px_80px_rgba(23,23,23,0.10)]">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-600">Crumb Stall</p>
        <h1 className="mt-2 text-3xl font-black">Login to save your orders</h1>
        <p className="mt-3 text-sm leading-6 text-stone-500">
          Use Google to keep favorites, cart, orders, and invoices tied to your account.
        </p>
        {params.error ? (
          <p className="mt-4 rounded-md bg-[#fff0f2] px-3 py-2 text-sm font-bold text-[#b91c2b]">
            Google login could not start. Please try again.
          </p>
        ) : null}
        <GoogleLoginButton callbackUrl={callbackUrl} />
      </section>
    </main>
  );
}

function sanitizeCallbackUrl(callbackUrl: string | undefined) {
  if (!callbackUrl || callbackUrl.startsWith("http://") || callbackUrl.startsWith("https://")) {
    return "/menu";
  }

  return callbackUrl.startsWith("/") ? callbackUrl : "/menu";
}
