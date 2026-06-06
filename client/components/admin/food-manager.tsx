"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState, useTransition } from "react";
import {
  createAdminFood,
  deactivateAdminFood,
  updateAdminFood,
  type AdminFoodItem,
  type FoodItemInput,
} from "@/lib/admin-foods";
import type { AdminCategory } from "@/lib/admin-categories";

export function FoodManager({
  categories,
  foods,
}: {
  categories: AdminCategory[];
  foods: AdminFoodItem[];
}) {
  const activeCategories = useMemo(
    () => categories.filter((category) => category.isActive),
    [categories],
  );
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function createFood(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const form = event.currentTarget;
    const input = readFoodForm(new FormData(form));

    startTransition(async () => {
      try {
        await createAdminFood(input);
        form.reset();
        setMessage("Food item created");
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Food item creation failed");
      }
    });
  }

  return (
    <div className="mt-8 grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <section className="h-fit rounded-lg bg-white p-5 shadow-sm">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-600">
          New food item
        </p>
        <h2 className="mt-2 text-2xl font-black">Add menu item</h2>
        <form onSubmit={createFood} className="mt-5 space-y-4">
          <FoodFields categories={activeCategories} />
          <button
            type="submit"
            disabled={isPending || activeCategories.length === 0}
            className="w-full rounded-md bg-stone-950 px-5 py-3 text-sm font-black text-white disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Create item"}
          </button>
          {activeCategories.length === 0 ? (
            <p className="text-sm font-bold text-stone-500">
              Create an active category before adding food items.
            </p>
          ) : null}
          {message ? <p className="text-sm font-black text-orange-700">{message}</p> : null}
        </form>
      </section>

      <section className="overflow-hidden rounded-lg bg-white shadow-sm">
        <div className="border-b border-stone-100 p-5">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-600">
            Food items
          </p>
          <h2 className="mt-2 text-2xl font-black">Menu catalog</h2>
        </div>
        {foods.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-xl font-black">No food items yet</p>
            <p className="mt-2 text-sm font-semibold text-stone-500">
              Add dishes, drinks, or combos for customers to order.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {foods.map((food) => (
              <FoodRow key={food.id} food={food} categories={activeCategories} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function FoodRow({
  food,
  categories,
}: {
  food: AdminFoodItem;
  categories: AdminCategory[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function updateFood(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const input = readFoodForm(new FormData(event.currentTarget));

    startTransition(async () => {
      try {
        await updateAdminFood(food.id, input);
        setMessage("Saved");
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Food item update failed");
      }
    });
  }

  function deactivateFood() {
    setMessage("");

    startTransition(async () => {
      try {
        await deactivateAdminFood(food.id);
        setMessage("Marked unavailable");
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Food item deactivation failed");
      }
    });
  }

  return (
    <form onSubmit={updateFood} className="grid gap-4 p-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <p className="text-xl font-black">{food.name}</p>
          <p className="mt-1 text-sm font-semibold text-stone-500">
            /{food.slug} · {food.category.name} · Rs {food.finalPrice}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusPill active={food.isAvailable} activeLabel="Available" inactiveLabel="Hidden" />
          {food.isFeatured ? (
            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-700">
              Featured
            </span>
          ) : null}
        </div>
      </div>

      <FoodFields categories={categories} food={food} />

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
          onClick={deactivateFood}
          disabled={isPending || !food.isAvailable}
          className="rounded-md bg-stone-100 px-4 py-2 text-sm font-black text-stone-700 disabled:opacity-50"
        >
          Mark unavailable
        </button>
        {message ? <span className="text-xs font-black text-orange-700">{message}</span> : null}
      </div>
    </form>
  );
}

function FoodFields({
  categories,
  food,
}: {
  categories: AdminCategory[];
  food?: AdminFoodItem;
}) {
  return (
    <div className="grid gap-3">
      <label className="grid gap-1 text-sm font-black">
        Category
        <select
          name="categoryId"
          required
          defaultValue={food?.category.id ?? categories[0]?.id ?? ""}
          className="rounded-md border border-stone-200 px-3 py-2 font-semibold outline-none focus:border-orange-600"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-black">
        Name
        <input
          name="name"
          required
          defaultValue={food?.name}
          className="rounded-md border border-stone-200 px-3 py-2 font-semibold outline-none focus:border-orange-600"
        />
      </label>
      <label className="grid gap-1 text-sm font-black">
        Slug
        <input
          name="slug"
          defaultValue={food?.slug}
          placeholder="Auto-generated if blank"
          className="rounded-md border border-stone-200 px-3 py-2 font-semibold outline-none focus:border-orange-600"
        />
      </label>
      <label className="grid gap-1 text-sm font-black">
        Description
        <textarea
          name="description"
          required
          defaultValue={food?.description ?? ""}
          rows={3}
          className="resize-none rounded-md border border-stone-200 px-3 py-2 font-semibold outline-none focus:border-orange-600"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-black">
          Price
          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            required
            defaultValue={food?.price ?? ""}
            className="rounded-md border border-stone-200 px-3 py-2 font-semibold outline-none focus:border-orange-600"
          />
        </label>
        <label className="grid gap-1 text-sm font-black">
          Discount price
          <input
            name="discountPrice"
            type="number"
            min="0"
            step="0.01"
            defaultValue={food?.discountPrice ?? ""}
            className="rounded-md border border-stone-200 px-3 py-2 font-semibold outline-none focus:border-orange-600"
          />
        </label>
      </div>
      <label className="grid gap-1 text-sm font-black">
        Image URL
        <input
          name="imageUrl"
          defaultValue={food?.imageUrl ?? ""}
          placeholder="https://..."
          className="rounded-md border border-stone-200 px-3 py-2 font-semibold outline-none focus:border-orange-600"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-black">
          Type
          <select
            name="type"
            defaultValue={food?.type ?? "VEG"}
            className="rounded-md border border-stone-200 px-3 py-2 font-semibold outline-none focus:border-orange-600"
          >
            <option value="VEG">Veg</option>
            <option value="NON_VEG">Non-veg</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-black">
          Popularity
          <input
            name="popularity"
            type="number"
            min="0"
            defaultValue={food?.popularity ?? 0}
            className="rounded-md border border-stone-200 px-3 py-2 font-semibold outline-none focus:border-orange-600"
          />
        </label>
      </div>
      <label className="grid gap-1 text-sm font-black">
        Ingredients
        <input
          name="ingredients"
          defaultValue={food?.ingredients?.join(", ") ?? ""}
          placeholder="Paneer, onion, sauce"
          className="rounded-md border border-stone-200 px-3 py-2 font-semibold outline-none focus:border-orange-600"
        />
      </label>
      <label className="grid gap-1 text-sm font-black">
        Tags
        <input
          name="tags"
          defaultValue={food?.tags?.join(", ") ?? ""}
          placeholder="popular, spicy, quick-bite"
          className="rounded-md border border-stone-200 px-3 py-2 font-semibold outline-none focus:border-orange-600"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex items-center gap-2 rounded-md border border-stone-200 px-3 py-2 text-sm font-black">
          <input
            name="isAvailable"
            type="checkbox"
            defaultChecked={food?.isAvailable ?? true}
            className="size-4 accent-orange-600"
          />
          Available
        </label>
        <label className="flex items-center gap-2 rounded-md border border-stone-200 px-3 py-2 text-sm font-black">
          <input
            name="isFeatured"
            type="checkbox"
            defaultChecked={food?.isFeatured ?? false}
            className="size-4 accent-orange-600"
          />
          Featured
        </label>
      </div>
    </div>
  );
}

function StatusPill({
  active,
  activeLabel,
  inactiveLabel,
}: {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
}) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-black ${
        active ? "bg-green-50 text-green-700" : "bg-stone-100 text-stone-500"
      }`}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

function readFoodForm(formData: FormData): FoodItemInput {
  return {
    categoryId: readString(formData, "categoryId"),
    name: readString(formData, "name"),
    slug: readOptionalString(formData, "slug"),
    description: readString(formData, "description"),
    ingredients: readList(formData, "ingredients"),
    price: readNumber(formData, "price"),
    discountPrice: readOptionalNumber(formData, "discountPrice"),
    imageUrl: readOptionalString(formData, "imageUrl") ?? "",
    tags: readList(formData, "tags"),
    type: readString(formData, "type") === "NON_VEG" ? "NON_VEG" : "VEG",
    popularity: readNumber(formData, "popularity"),
    isAvailable: formData.get("isAvailable") === "on",
    isFeatured: formData.get("isFeatured") === "on",
  };
}

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function readOptionalString(formData: FormData, key: string) {
  const value = readString(formData, key);

  return value || undefined;
}

function readNumber(formData: FormData, key: string) {
  const value = Number(formData.get(key) ?? 0);

  return Number.isFinite(value) ? value : 0;
}

function readOptionalNumber(formData: FormData, key: string) {
  const value = readString(formData, key);

  if (!value) {
    return null;
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : null;
}

function readList(formData: FormData, key: string) {
  return readString(formData, key)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}
