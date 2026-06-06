"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export function AdminLoginForm({
  callbackUrl,
  error,
}: {
  callbackUrl: string;
  error?: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(
    error ? "Admin sign in failed. Check credentials and approval status." : null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === "register") {
        const response = await fetch("/api/admin-auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const payload = (await response.json().catch(() => null)) as { message?: string } | null;

        if (!response.ok) {
          setMessage(payload?.message ?? "Admin registration request failed.");
          return;
        }

        setMessage(
          payload?.message ??
            "Admin request submitted. A super admin must approve it before sign in works.",
        );
        setMode("login");
        return;
      }

      const result = await signIn("admin-credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (!result || result.error) {
        setMessage("Admin sign in failed. Check credentials and approval status.");
        return;
      }

      router.push(result.url ?? callbackUrl);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-6">
      <div className="grid grid-cols-2 rounded-lg bg-stone-100 p-1 text-sm font-black">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setMessage(null);
          }}
          className={`rounded-md px-4 py-3 transition ${
            mode === "login" ? "bg-stone-950 text-white shadow-sm" : "text-stone-500"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("register");
            setMessage(null);
          }}
          className={`rounded-md px-4 py-3 transition ${
            mode === "register" ? "bg-stone-950 text-white shadow-sm" : "text-stone-500"
          }`}
        >
          Request access
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {mode === "register" ? (
          <label className="block">
            <span className="text-sm font-black text-stone-600">Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              minLength={2}
              placeholder="Your full name"
              className="mt-2 w-full rounded-md border border-stone-200 bg-stone-50 px-4 py-3 font-semibold outline-none transition focus:border-[#e23744] focus:bg-white"
            />
          </label>
        ) : null}
        <label className="block">
          <span className="text-sm font-black text-stone-600">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="staff@crumbstall.com"
            className="mt-2 w-full rounded-md border border-stone-200 bg-stone-50 px-4 py-3 font-semibold outline-none transition focus:border-[#e23744] focus:bg-white"
          />
        </label>
        <label className="block">
          <span className="text-sm font-black text-stone-600">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={mode === "register" ? 10 : 8}
            placeholder={mode === "register" ? "Minimum 10 characters" : "Your password"}
            className="mt-2 w-full rounded-md border border-stone-200 bg-stone-50 px-4 py-3 font-semibold outline-none transition focus:border-[#e23744] focus:bg-white"
          />
        </label>
        {message ? (
          <p className="rounded-md border border-[#ffd7dd] bg-[#fff0f2] px-3 py-2 text-sm font-bold text-[#b91c2b]">
            {message}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-[#e23744] px-5 py-3 font-black text-white transition hover:bg-[#b91c2b] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? "Please wait..."
            : mode === "login"
              ? "Sign in to admin"
              : "Submit admin request"}
        </button>
      </form>
      <p className="mt-4 text-center text-xs font-semibold text-stone-500">
        Customer Google login cannot open admin pages.
      </p>
    </div>
  );
}
