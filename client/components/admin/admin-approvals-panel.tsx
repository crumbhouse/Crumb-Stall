"use client";

import { useCallback, useEffect, useState } from "react";

type AdminRequest = {
  id: string;
  email: string;
  name: string | null;
  adminRequestedAt: string | null;
};

export function AdminApprovalsPanel() {
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    try {
      const response = await fetch("/api/admin-auth/requests", {
        cache: "no-store",
      });

      if (!response.ok) {
        setMessage("Could not load admin requests.");
        return;
      }

      const payload = (await response.json()) as { data?: AdminRequest[] };
      setRequests(payload.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  async function approveRequest(userId: string) {
    setMessage(null);
    const response = await fetch(`/api/admin-auth/requests/${encodeURIComponent(userId)}/approve`, {
      method: "PATCH",
    });

    if (!response.ok) {
      setMessage("Approval failed. Try again.");
      return;
    }

    setRequests((current) => current.filter((request) => request.id !== userId));
    setMessage("Admin approved.");
  }

  if (loading) {
    return (
      <div className="mt-6 rounded-lg bg-white p-6 text-sm font-bold text-stone-500 shadow-sm">
        Loading requests...
      </div>
    );
  }

  return (
    <section className="mt-6 rounded-lg bg-white p-5 shadow-sm">
      {message ? (
        <p className="mb-4 rounded-md bg-stone-100 px-3 py-2 text-sm font-bold text-stone-700">
          {message}
        </p>
      ) : null}
      {requests.length === 0 ? (
        <div className="rounded-lg border border-dashed border-stone-200 p-8 text-center">
          <p className="text-xl font-black">No pending requests</p>
          <p className="mt-2 text-sm font-semibold text-stone-500">
            New admin registrations will appear here after they submit access.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <article
              key={request.id}
              className="flex flex-col justify-between gap-4 rounded-lg border border-stone-100 p-4 sm:flex-row sm:items-center"
            >
              <div>
                <p className="font-black">{request.name ?? "Unnamed request"}</p>
                <p className="mt-1 text-sm font-semibold text-stone-500">{request.email}</p>
                <p className="mt-1 text-xs font-bold text-stone-400">
                  Requested {formatDateTime(request.adminRequestedAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void approveRequest(request.id)}
                className="rounded-md bg-stone-950 px-4 py-3 text-sm font-black text-white"
              >
                Approve
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "date unavailable";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
