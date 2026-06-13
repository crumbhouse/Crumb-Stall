"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { AdminFoodItem } from "@/lib/admin-foods";
import { createAdminCounterOrder } from "@/lib/admin-orders";

type CounterOrderLine = {
  foodItemId: string;
  slug: string;
  name: string;
  unitPrice: number;
  quantity: number;
  note: string;
};

const pickupSlots = [
  {
    id: "asap",
    label: "ASAP",
    description: "Priority preparation",
    minutesFromNow: 0,
    fee: 5,
  },
  {
    id: "15-min",
    label: "15 min",
    description: "Collect after 15 minutes",
    minutesFromNow: 15,
    fee: 0,
  },
  {
    id: "30-min",
    label: "30 min",
    description: "Collect after 30 minutes",
    minutesFromNow: 30,
    fee: 0,
  },
] as const;

export function CounterOrderForm({ foods }: { foods: AdminFoodItem[] }) {
  const router = useRouter();
  const availableFoods = useMemo(() => foods.filter((food) => food.isAvailable), [foods]);
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [selectedFoodId, setSelectedFoodId] = useState(availableFoods[0]?.id ?? "");
  const [lines, setLines] = useState<CounterOrderLine[]>([]);
  const [pickupSlotId, setPickupSlotId] = useState<(typeof pickupSlots)[number]["id"]>("15-min");
  const [paymentCollected, setPaymentCollected] = useState(true);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const pickupSlot =
    pickupSlots.find((slot) => slot.id === pickupSlotId) ?? pickupSlots[1];
  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax + pickupSlot.fee;

  function addSelectedFood() {
    const food = availableFoods.find((item) => item.id === selectedFoodId);

    if (!food) {
      return;
    }

    setLines((currentLines) => {
      const existingLine = currentLines.find((line) => line.foodItemId === food.id);

      if (existingLine) {
        return currentLines.map((line) =>
          line.foodItemId === food.id
            ? { ...line, quantity: Math.min(line.quantity + 1, 20) }
            : line,
        );
      }

      return [
        ...currentLines,
        {
          foodItemId: food.id,
          slug: food.slug,
          name: food.name,
          unitPrice: food.finalPrice,
          quantity: 1,
          note: "",
        },
      ];
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!customerPhone.trim()) {
      setMessage("Customer phone number is required.");
      return;
    }

    if (lines.length === 0) {
      setMessage("Add at least one item.");
      return;
    }

    setIsSaving(true);

    try {
      const order = await createAdminCounterOrder({
        customer: {
          email: customerEmail || undefined,
          name: customerName || undefined,
          phone: customerPhone,
        },
        items: lines.map((line) => ({
          foodItemId: line.foodItemId,
          slug: line.slug,
          quantity: line.quantity,
          note: line.note || undefined,
        })),
        couponCode: couponCode || undefined,
        pickupSlot,
        paymentCollected,
      });

      router.push(`/admin/orders/${order.orderNumber}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Counter order could not be created.");
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-5">
        <section className="rounded-lg bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black">Customer</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-stone-500">
                Phone
              </span>
              <input
                required
                value={customerPhone}
                onChange={(event) => setCustomerPhone(event.target.value)}
                className="mt-2 w-full rounded-md border border-stone-200 bg-[#fbfaf7] px-3 py-3 text-sm font-semibold outline-none focus:border-orange-600"
                placeholder="Customer phone number"
              />
            </label>
            <label className="block">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-stone-500">
                Email
              </span>
              <input
                type="email"
                value={customerEmail}
                onChange={(event) => setCustomerEmail(event.target.value)}
                className="mt-2 w-full rounded-md border border-stone-200 bg-[#fbfaf7] px-3 py-3 text-sm font-semibold outline-none focus:border-orange-600"
                placeholder="Optional email"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-stone-500">
                Name
              </span>
              <input
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                className="mt-2 w-full rounded-md border border-stone-200 bg-[#fbfaf7] px-3 py-3 text-sm font-semibold outline-none focus:border-orange-600"
                placeholder="Customer name"
              />
            </label>
          </div>
        </section>

        <section className="rounded-lg bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-xl font-black">Items</h2>
              <p className="mt-1 text-sm font-semibold text-stone-500">
                Only currently visible menu items can be added.
              </p>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedFoodId}
                onChange={(event) => setSelectedFoodId(event.target.value)}
                className="min-w-0 rounded-md border border-stone-200 bg-[#fbfaf7] px-3 py-3 text-sm font-black outline-none focus:border-orange-600"
              >
                {availableFoods.map((food) => (
                  <option key={food.id} value={food.id}>
                    {food.name} - Rs {food.finalPrice}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addSelectedFood}
                disabled={availableFoods.length === 0}
                className="rounded-md bg-[#171512] px-4 py-3 text-sm font-black text-white disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {lines.length === 0 ? (
              <p className="rounded-lg border border-dashed border-stone-200 bg-stone-50 p-5 text-sm font-bold text-stone-500">
                No items added yet.
              </p>
            ) : (
              lines.map((line) => (
                <div
                  key={line.foodItemId}
                  className="grid gap-3 rounded-lg bg-stone-50 p-4 lg:grid-cols-[minmax(0,1fr)_120px_120px_auto]"
                >
                  <div>
                    <p className="font-black">{line.name}</p>
                    <input
                      value={line.note}
                      onChange={(event) =>
                        setLines((currentLines) =>
                          currentLines.map((currentLine) =>
                            currentLine.foodItemId === line.foodItemId
                              ? { ...currentLine, note: event.target.value.slice(0, 120) }
                              : currentLine,
                          ),
                        )
                      }
                      className="mt-2 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-orange-600"
                      placeholder="Optional instruction"
                    />
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={line.quantity}
                    onChange={(event) => {
                      const quantity = Math.min(Math.max(Number(event.target.value) || 1, 1), 20);
                      setLines((currentLines) =>
                        currentLines.map((currentLine) =>
                          currentLine.foodItemId === line.foodItemId
                            ? { ...currentLine, quantity }
                            : currentLine,
                        ),
                      );
                    }}
                    className="rounded-md border border-stone-200 bg-white px-3 py-2 text-sm font-black outline-none focus:border-orange-600"
                    aria-label={`${line.name} quantity`}
                  />
                  <p className="self-center font-black">Rs {line.unitPrice * line.quantity}</p>
                  <button
                    type="button"
                    onClick={() =>
                      setLines((currentLines) =>
                        currentLines.filter((currentLine) => currentLine.foodItemId !== line.foodItemId),
                      )
                    }
                    className="self-center rounded-md border border-stone-200 px-3 py-2 text-xs font-black text-stone-600"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <aside className="h-fit space-y-5">
        <section className="rounded-lg bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black">Pickup</h2>
          <div className="mt-4 grid gap-2">
            {pickupSlots.map((slot) => (
              <label
                key={slot.id}
                className={`cursor-pointer rounded-md border p-3 ${
                  pickupSlotId === slot.id
                    ? "border-orange-600 bg-orange-50"
                    : "border-stone-200 bg-[#fbfaf7]"
                }`}
              >
                <input
                  type="radio"
                  name="pickupSlot"
                  value={slot.id}
                  checked={pickupSlotId === slot.id}
                  onChange={() => setPickupSlotId(slot.id)}
                  className="sr-only"
                />
                <span className="font-black">{slot.label}</span>
                <span className="ml-2 text-xs font-bold text-stone-500">
                  {slot.description}
                  {slot.fee > 0 ? ` (+Rs ${slot.fee})` : ""}
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-lg bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black">Payment</h2>
          <label className="mt-4 flex items-start gap-3 rounded-md bg-[#fbfaf7] p-3">
            <input
              type="checkbox"
              checked={paymentCollected}
              onChange={(event) => setPaymentCollected(event.target.checked)}
              className="mt-1"
            />
            <span>
              <span className="block text-sm font-black">Cash already collected</span>
              <span className="mt-1 block text-xs font-semibold text-stone-500">
                Checked orders are placed immediately. Unchecked orders wait for admin acceptance.
              </span>
            </span>
          </label>

          <div className="mt-5 space-y-3 border-t border-stone-200 pt-4 text-sm text-stone-600">
            <SummaryRow label="Subtotal" value={`Rs ${subtotal}`} />
            <SummaryRow label="Tax" value={`Rs ${tax}`} />
            {pickupSlot.fee > 0 ? <SummaryRow label="ASAP fee" value={`Rs ${pickupSlot.fee}`} /> : null}
            <div className="flex justify-between gap-4 border-t border-stone-200 pt-3 text-lg font-black text-stone-950">
              <span>Total</span>
              <span>Rs {total}</span>
            </div>
          </div>

          <label className="mt-4 block">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-stone-500">
              Coupon
            </span>
            <input
              value={couponCode}
              onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
              className="mt-2 w-full rounded-md border border-stone-200 bg-[#fbfaf7] px-3 py-3 text-sm font-semibold outline-none focus:border-orange-600"
              placeholder="Optional coupon"
            />
          </label>

          {message ? (
            <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSaving}
            className="mt-5 w-full rounded-md bg-orange-600 px-5 py-4 font-black text-white disabled:opacity-50"
          >
            {isSaving ? "Creating order..." : "Create counter order"}
          </button>
        </section>
      </aside>
    </form>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span>{label}</span>
      <span className="font-black text-stone-950">{value}</span>
    </div>
  );
}
