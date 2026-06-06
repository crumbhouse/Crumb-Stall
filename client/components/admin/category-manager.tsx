"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import {
  createAdminCategory,
  deactivateAdminCategory,
  updateAdminCategory,
  type AdminCategory,
  type CategoryInput,
} from "@/lib/admin-categories";

export function CategoryManager({ categories }: { categories: AdminCategory[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function createCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const form = event.currentTarget;
    const input = readCategoryForm(new FormData(form));

    startTransition(async () => {
      try {
        await createAdminCategory(input);
        form.reset();
        setMessage("Category created");
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Category creation failed");
      }
    });
  }

  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <section className="h-fit rounded-lg bg-white p-5 shadow-sm">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-600">
          New category
        </p>
        <h2 className="mt-2 text-2xl font-black">Add menu group</h2>
        <form onSubmit={createCategory} className="mt-5 space-y-4">
          <CategoryFields />
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-md bg-stone-950 px-5 py-3 text-sm font-black text-white disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Create category"}
          </button>
          {message ? <p className="text-sm font-black text-orange-700">{message}</p> : null}
        </form>
      </section>

      <section className="overflow-hidden rounded-lg bg-white shadow-sm">
        <div className="border-b border-stone-100 p-5">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-600">
            Categories
          </p>
          <h2 className="mt-2 text-2xl font-black">Catalog groups</h2>
        </div>
        {categories.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-xl font-black">No categories yet</p>
            <p className="mt-2 text-sm font-semibold text-stone-500">
              Create your first menu group to start organizing food items.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {categories.map((category) => (
              <CategoryRow key={category.id} category={category} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function CategoryRow({ category }: { category: AdminCategory }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function updateCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const input = readCategoryForm(new FormData(event.currentTarget), {
      includeActive: true,
    });

    startTransition(async () => {
      try {
        await updateAdminCategory(category.id, input);
        setMessage("Saved");
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Category update failed");
      }
    });
  }

  function deactivateCategory() {
    setMessage("");

    startTransition(async () => {
      try {
        await deactivateAdminCategory(category.id);
        setMessage("Deactivated");
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Category deactivation failed");
      }
    });
  }

  return (
    <form onSubmit={updateCategory} className="grid gap-4 p-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <p className="text-xl font-black">{category.name}</p>
          <p className="mt-1 text-sm font-semibold text-stone-500">
            /{category.slug} · {category.foodItemCount} item
            {category.foodItemCount === 1 ? "" : "s"}
          </p>
        </div>
        <span
          className={`w-fit rounded-full px-3 py-1 text-xs font-black ${
            category.isActive
              ? "bg-green-50 text-green-700"
              : "bg-stone-100 text-stone-500"
          }`}
        >
          {category.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <CategoryFields category={category} showActive />

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
          onClick={deactivateCategory}
          disabled={isPending || !category.isActive}
          className="rounded-md bg-stone-100 px-4 py-2 text-sm font-black text-stone-700 disabled:opacity-50"
        >
          Deactivate
        </button>
        {message ? <span className="text-xs font-black text-orange-700">{message}</span> : null}
      </div>
    </form>
  );
}

function CategoryFields({
  category,
  showActive = false,
}: {
  category?: AdminCategory;
  showActive?: boolean;
}) {
  return (
    <div className="grid gap-3">
      <label className="grid gap-1 text-sm font-black">
        Name
        <input
          name="name"
          required
          defaultValue={category?.name}
          className="rounded-md border border-stone-200 px-3 py-2 font-semibold outline-none focus:border-orange-600"
        />
      </label>
      <label className="grid gap-1 text-sm font-black">
        Slug
        <input
          name="slug"
          defaultValue={category?.slug}
          placeholder="Auto-generated if blank"
          className="rounded-md border border-stone-200 px-3 py-2 font-semibold outline-none focus:border-orange-600"
        />
      </label>
      <label className="grid gap-1 text-sm font-black">
        Description
        <textarea
          name="description"
          defaultValue={category?.description ?? ""}
          rows={3}
          className="resize-none rounded-md border border-stone-200 px-3 py-2 font-semibold outline-none focus:border-orange-600"
        />
      </label>
      <label className="grid gap-1 text-sm font-black">
        Image URL
        <input
          name="imageUrl"
          defaultValue={category?.imageUrl ?? ""}
          placeholder="https://..."
          className="rounded-md border border-stone-200 px-3 py-2 font-semibold outline-none focus:border-orange-600"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-black">
          Sort order
          <input
            name="sortOrder"
            type="number"
            min="0"
            defaultValue={category?.sortOrder ?? 0}
            className="rounded-md border border-stone-200 px-3 py-2 font-semibold outline-none focus:border-orange-600"
          />
        </label>
        {showActive ? (
          <label className="flex items-center gap-2 rounded-md border border-stone-200 px-3 py-2 text-sm font-black">
            <input
              name="isActive"
              type="checkbox"
              defaultChecked={category?.isActive}
              className="size-4 accent-orange-600"
            />
            Active
          </label>
        ) : null}
      </div>
    </div>
  );
}

function readCategoryForm(
  formData: FormData,
  options: { includeActive?: boolean } = {},
): CategoryInput {
  const sortOrder = Number(formData.get("sortOrder") ?? 0);

  return {
    name: readString(formData, "name"),
    slug: readOptionalString(formData, "slug"),
    description: readOptionalString(formData, "description") ?? "",
    imageUrl: readOptionalString(formData, "imageUrl") ?? "",
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    ...(options.includeActive ? { isActive: formData.get("isActive") === "on" } : {}),
  };
}

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function readOptionalString(formData: FormData, key: string) {
  const value = readString(formData, key);

  return value || undefined;
}
