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
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
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
        setIsCreateOpen(false);
        setMessage("Category created");
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Category creation failed");
      }
    });
  }

  return (
    <section className="mt-6 overflow-hidden rounded-lg border border-[#e5ddd2] bg-white shadow-sm">
      <div className="flex flex-col justify-between gap-4 border-b border-[#eee8df] p-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-600">
            Categories
          </p>
          <h2 className="mt-2 text-2xl font-black">Catalog groups</h2>
          <p className="mt-1 text-sm font-semibold text-stone-500">
            Keep menu sections tidy and ready for customer browsing.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="w-fit rounded-md bg-[#171512] px-4 py-3 text-sm font-black text-white"
        >
          Add category
        </button>
      </div>

      {message ? (
        <div className="border-b border-orange-100 bg-orange-50 px-5 py-3 text-sm font-black text-orange-800">
          {message}
        </div>
      ) : null}

      {categories.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-xl font-black">No categories yet</p>
          <p className="mt-2 text-sm font-semibold text-stone-500">
            Create your first menu group to start organizing food items.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={() => setEditingCategory(category)}
            />
          ))}
        </div>
      )}

      {isCreateOpen ? (
        <CategoryModal title="Add menu group" onClose={() => setIsCreateOpen(false)}>
          <form onSubmit={createCategory} className="space-y-4">
            <CategoryFields />
            <ModalActions
              isPending={isPending}
              submitLabel={isPending ? "Saving..." : "Create category"}
              onCancel={() => setIsCreateOpen(false)}
            />
          </form>
        </CategoryModal>
      ) : null}

      {editingCategory ? (
        <CategoryEditor
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onMessage={setMessage}
        />
      ) : null}
    </section>
  );
}

function CategoryCard({
  category,
  onEdit,
}: {
  category: AdminCategory;
  onEdit: () => void;
}) {
  return (
    <article className="rounded-lg border border-[#eee8df] bg-[#fbfaf7] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-lg font-black">{category.name}</p>
          <p className="mt-1 truncate text-sm font-semibold text-stone-500">/{category.slug}</p>
        </div>
        <StatusPill active={category.isActive} activeLabel="Active" inactiveLabel="Inactive" />
      </div>
      <p className="mt-4 text-sm font-bold text-stone-600">
        {category.foodItemCount} item{category.foodItemCount === 1 ? "" : "s"} in this group
      </p>
      <button
        type="button"
        onClick={onEdit}
        className="mt-4 w-full rounded-md border border-[#ddd4c8] bg-white px-3 py-2 text-sm font-black text-[#51483d]"
      >
        View or edit
      </button>
    </article>
  );
}

function CategoryEditor({
  category,
  onClose,
  onMessage,
}: {
  category: AdminCategory;
  onClose: () => void;
  onMessage: (message: string) => void;
}) {
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
        onMessage("Category saved");
        onClose();
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
        onMessage("Category deactivated");
        onClose();
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Category deactivation failed");
      }
    });
  }

  return (
    <CategoryModal title={category.name} onClose={onClose}>
      <form onSubmit={updateCategory} className="space-y-4">
        <CategoryFields category={category} showActive />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={deactivateCategory}
            disabled={isPending || !category.isActive}
            className="rounded-md bg-stone-100 px-4 py-3 text-sm font-black text-stone-700 disabled:opacity-50"
          >
            Deactivate
          </button>
          <ModalActions
            isPending={isPending}
            submitLabel={isPending ? "Saving..." : "Save category"}
            onCancel={onClose}
          />
        </div>
        {message ? <p className="text-xs font-black text-orange-700">{message}</p> : null}
      </form>
    </CategoryModal>
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

function CategoryModal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/35 p-0 sm:place-items-center sm:p-4">
      <section className="max-h-[92vh] w-full overflow-y-auto rounded-t-lg bg-white p-5 shadow-2xl sm:max-w-2xl sm:rounded-lg">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">
              Menu category
            </p>
            <h3 className="mt-1 text-2xl font-black">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-stone-100 px-3 py-2 text-sm font-black text-stone-700"
          >
            Close
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

function ModalActions({
  isPending,
  submitLabel,
  onCancel,
}: {
  isPending: boolean;
  submitLabel: string;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-md border border-stone-200 bg-white px-4 py-3 text-sm font-black text-stone-700"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-[#171512] px-5 py-3 text-sm font-black text-white disabled:opacity-50"
      >
        {submitLabel}
      </button>
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
      className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${
        active ? "bg-green-50 text-green-700" : "bg-stone-100 text-stone-500"
      }`}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
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
