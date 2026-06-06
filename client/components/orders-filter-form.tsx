"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

type OrderStatusOption = {
  value: string;
  label: string;
};

export function OrdersFilterForm({
  initialSearch,
  initialStatus,
  statuses,
}: {
  initialSearch: string;
  initialStatus: string;
  statuses: OrderStatusOption[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();
    const normalizedSearch = search.trim();

    if (normalizedSearch) {
      params.set("search", normalizedSearch);
    }

    if (status) {
      params.set("status", status);
    }

    const query = params.toString();
    router.push(query ? `/orders?${query}` : "/orders");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 grid gap-3 rounded-lg border border-[#e8e8e3] bg-white p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_220px_auto]"
    >
      <label htmlFor="order-search" className="sr-only">
        Search orders
      </label>
      <input
        id="order-search"
        name="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search by order number or item"
        className="min-w-0 rounded-md border border-[#e8e8e3] px-3 py-3 text-sm font-semibold outline-none focus:border-[#e23744]"
      />
      <label htmlFor="order-status" className="sr-only">
        Status
      </label>
      <select
        id="order-status"
        name="status"
        value={status}
        onChange={(event) => setStatus(event.target.value)}
        className="min-w-0 rounded-md border border-[#e8e8e3] px-3 py-3 text-sm font-black outline-none focus:border-[#e23744]"
      >
        {statuses.map((option) => (
          <option key={option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-md bg-[#171717] px-5 py-3 text-sm font-black text-white"
      >
        Filter
      </button>
    </form>
  );
}
