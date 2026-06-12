"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState, useTransition, type ReactNode } from "react";
import {
  createAdminFood,
  deactivateAdminFood,
  updateAdminFood,
  uploadFoodImage,
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
  const groupedFoods = useMemo(
    () =>
      categories
        .map((category) => ({
          category,
          foods: foods.filter((food) => food.category.id === category.id),
        }))
        .filter((group) => group.foods.length > 0),
    [categories, foods],
  );
  const uncategorizedFoods = foods.filter(
    (food) => !categories.some((category) => category.id === food.category.id),
  );
  const [message, setMessage] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<AdminFoodItem | null>(null);

  return (
    <section className="mt-6 overflow-hidden rounded-lg border border-[#e5ddd2] bg-white shadow-sm">
      <div className="flex flex-col justify-between gap-4 border-b border-[#eee8df] p-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-600">
            Food items
          </p>
          <h2 className="mt-2 text-2xl font-black">Menu catalog</h2>
          <p className="mt-1 text-sm font-semibold text-stone-500">
            {foods.length} item{foods.length === 1 ? "" : "s"} across {categories.length} group
            {categories.length === 1 ? "" : "s"}.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          disabled={activeCategories.length === 0}
          className="w-fit rounded-md bg-[#171512] px-4 py-3 text-sm font-black text-white disabled:opacity-50"
        >
          Add item
        </button>
      </div>

      {activeCategories.length === 0 ? (
        <div className="border-b border-orange-100 bg-orange-50 px-5 py-3 text-sm font-bold text-orange-800">
          Create an active category before adding food items.
        </div>
      ) : null}

      {message ? (
        <div className="border-b border-orange-100 bg-orange-50 px-5 py-3 text-sm font-black text-orange-800">
          {message}
        </div>
      ) : null}

      {foods.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-xl font-black">No food items yet</p>
          <p className="mt-2 text-sm font-semibold text-stone-500">
            Add dishes, drinks, or combos for customers to order.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#eee8df]">
          {groupedFoods.map((group) => (
            <FoodGroup
              key={group.category.id}
              category={group.category}
              foods={group.foods}
              categories={activeCategories}
              onEdit={setEditingFood}
              onMessage={setMessage}
            />
          ))}
          {uncategorizedFoods.length > 0 ? (
            <FoodGroup
              category={{
                id: uncategorizedFoods[0].category.id,
                name: uncategorizedFoods[0].category.name,
                isActive: true,
              }}
              foods={uncategorizedFoods}
              categories={activeCategories}
              onEdit={setEditingFood}
              onMessage={setMessage}
            />
          ) : null}
        </div>
      )}

      {isCreateOpen ? (
        <FoodCreateModal
          categories={activeCategories}
          onClose={() => setIsCreateOpen(false)}
          onMessage={setMessage}
        />
      ) : null}

      {editingFood ? (
        <FoodEditModal
          food={editingFood}
          categories={activeCategories}
          onClose={() => setEditingFood(null)}
          onMessage={setMessage}
        />
      ) : null}
    </section>
  );
}

function FoodGroup({
  category,
  foods,
  categories,
  onEdit,
  onMessage,
}: {
  category: Pick<AdminCategory, "id" | "name" | "isActive">;
  foods: AdminFoodItem[];
  categories: AdminCategory[];
  onEdit: (food: AdminFoodItem) => void;
  onMessage: (message: string) => void;
}) {
  return (
    <section className="p-4 sm:p-5">
      <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <h3 className="text-lg font-black">{category.name}</h3>
          <p className="text-sm font-semibold text-stone-500">
            {foods.length} item{foods.length === 1 ? "" : "s"} in this section
          </p>
        </div>
        <StatusPill active={category.isActive} activeLabel="Active group" inactiveLabel="Inactive group" />
      </div>
      <div className="grid gap-3">
        {foods.map((food) => (
          <FoodRow
            key={food.id}
            food={food}
            categories={categories}
            onEdit={() => onEdit(food)}
            onMessage={onMessage}
          />
        ))}
      </div>
    </section>
  );
}

function FoodRow({
  food,
  onEdit,
  onMessage,
}: {
  food: AdminFoodItem;
  categories: AdminCategory[];
  onEdit: () => void;
  onMessage: (message: string) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const imageUrl = food.imageUrl;

  function updateFlags(input: Partial<FoodItemInput>, successMessage: string) {
    startTransition(async () => {
      try {
        await updateAdminFood(food.id, input);
        onMessage(successMessage);
        router.refresh();
      } catch (error) {
        onMessage(error instanceof Error ? error.message : "Food item update failed");
      }
    });
  }

  return (
    <article className="grid gap-4 rounded-lg border border-[#eee8df] bg-[#fbfaf7] p-3 sm:grid-cols-[88px_minmax(0,1fr)_auto] sm:items-center">
      <div className="size-20 overflow-hidden rounded-lg bg-stone-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={food.name}
            width={96}
            height={96}
            unoptimized
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-lg font-black text-stone-300">
            {food.name.slice(0, 2)}
          </div>
        )}
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-lg font-black">{food.name}</p>
          <StatusPill active={food.isAvailable} activeLabel="Available" inactiveLabel="Hidden" />
          {food.isFeatured ? (
            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-700">
              Featured
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-sm font-semibold text-stone-500">
          /{food.slug} · Rs {food.finalPrice} · {food.type === "NON_VEG" ? "Non-veg" : "Veg"}
        </p>
        <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-stone-600">
          {food.description}
        </p>
      </div>
      <div className="flex flex-wrap gap-2 sm:justify-end">
        <button
          type="button"
          onClick={onEdit}
          className="rounded-md bg-[#171512] px-4 py-2 text-sm font-black text-white"
        >
          View or edit
        </button>
        <button
          type="button"
          onClick={() =>
            updateFlags(
              { isAvailable: !food.isAvailable },
              food.isAvailable ? "Item hidden from menu" : "Item is available",
            )
          }
          disabled={isPending}
          className="rounded-md border border-[#ddd4c8] bg-white px-4 py-2 text-sm font-black text-stone-700 disabled:opacity-50"
        >
          {food.isAvailable ? "Hide" : "Show"}
        </button>
        <button
          type="button"
          onClick={() =>
            updateFlags(
              { isFeatured: !food.isFeatured },
              food.isFeatured ? "Removed from featured" : "Marked featured",
            )
          }
          disabled={isPending}
          className="rounded-md border border-orange-100 bg-orange-50 px-4 py-2 text-sm font-black text-orange-700 disabled:opacity-50"
        >
          {food.isFeatured ? "Unfeature" : "Feature"}
        </button>
      </div>
    </article>
  );
}

function FoodCreateModal({
  categories,
  onClose,
  onMessage,
}: {
  categories: AdminCategory[];
  onClose: () => void;
  onMessage: (message: string) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function createFood(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const input = readFoodForm(new FormData(form));

    startTransition(async () => {
      try {
        await createAdminFood(input);
        form.reset();
        onMessage("Food item created");
        onClose();
        router.refresh();
      } catch (error) {
        onMessage(error instanceof Error ? error.message : "Food item creation failed");
      }
    });
  }

  return (
    <FoodModal title="Add menu item" onClose={onClose}>
      <form onSubmit={createFood} className="space-y-4">
        <FoodFields categories={categories} />
        <ModalActions
          isPending={isPending}
          submitLabel={isPending ? "Saving..." : "Create item"}
          onCancel={onClose}
        />
      </form>
    </FoodModal>
  );
}

function FoodEditModal({
  food,
  categories,
  onClose,
  onMessage,
}: {
  food: AdminFoodItem;
  categories: AdminCategory[];
  onClose: () => void;
  onMessage: (message: string) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [localMessage, setLocalMessage] = useState("");

  function updateFood(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalMessage("");
    const input = readFoodForm(new FormData(event.currentTarget));

    startTransition(async () => {
      try {
        await updateAdminFood(food.id, input);
        onMessage("Food item saved");
        onClose();
        router.refresh();
      } catch (error) {
        setLocalMessage(error instanceof Error ? error.message : "Food item update failed");
      }
    });
  }

  function deactivateFood() {
    setLocalMessage("");

    startTransition(async () => {
      try {
        await deactivateAdminFood(food.id);
        onMessage("Food item marked unavailable");
        onClose();
        router.refresh();
      } catch (error) {
        setLocalMessage(error instanceof Error ? error.message : "Food item deactivation failed");
      }
    });
  }

  return (
    <FoodModal title={food.name} onClose={onClose}>
      <form onSubmit={updateFood} className="space-y-4">
        <FoodFields categories={categories} food={food} />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={deactivateFood}
            disabled={isPending || !food.isAvailable}
            className="rounded-md bg-stone-100 px-4 py-3 text-sm font-black text-stone-700 disabled:opacity-50"
          >
            Mark unavailable
          </button>
          <ModalActions
            isPending={isPending}
            submitLabel={isPending ? "Saving..." : "Save item"}
            onCancel={onClose}
          />
        </div>
        {localMessage ? <p className="text-xs font-black text-orange-700">{localMessage}</p> : null}
      </form>
    </FoodModal>
  );
}

function FoodFields({
  categories,
  food,
}: {
  categories: AdminCategory[];
  food?: AdminFoodItem;
}) {
  const [imageUrl, setImageUrl] = useState(food?.imageUrl ?? "");
  const [uploadMessage, setUploadMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  async function uploadImage(file: File | undefined) {
    if (!file) {
      return;
    }

    setUploadMessage("");
    setIsUploading(true);

    try {
      const payload = await uploadFoodImage(file);
      setImageUrl(payload.imageUrl);
      setUploadMessage("Image uploaded. Save the item to keep it.");
    } catch (error) {
      setUploadMessage(error instanceof Error ? error.message : "Food image upload failed");
    } finally {
      setIsUploading(false);
    }
  }

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
      <div className="grid gap-3 sm:grid-cols-2">
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
      </div>
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
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          placeholder="https://..."
          className="rounded-md border border-stone-200 px-3 py-2 font-semibold outline-none focus:border-orange-600"
        />
      </label>
      <div className="grid gap-2 rounded-md border border-dashed border-stone-200 bg-stone-50 p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => void uploadImage(event.target.files?.[0])}
            className="min-w-0 text-sm font-bold text-stone-600 file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-black file:text-stone-900"
          />
          <span className="text-xs font-bold text-stone-500">JPG, PNG, or WebP up to 5MB</span>
        </div>
        {imageUrl ? (
          <div className="flex items-center gap-3">
            <Image
              src={imageUrl}
              alt="Food preview"
              width={64}
              height={64}
              unoptimized
              className="size-16 rounded-md object-cover ring-1 ring-stone-200"
            />
            <button
              type="button"
              onClick={() => setImageUrl("")}
              className="rounded-md bg-white px-3 py-2 text-xs font-black text-stone-700 ring-1 ring-stone-200"
            >
              Clear image
            </button>
          </div>
        ) : null}
        {isUploading || uploadMessage ? (
          <p className="text-xs font-black text-orange-700">
            {isUploading ? "Uploading..." : uploadMessage}
          </p>
        ) : null}
      </div>
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
      <div className="grid gap-3 sm:grid-cols-2">
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
      </div>
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

function FoodModal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/35 p-0 sm:place-items-center sm:p-4">
      <section className="max-h-[92vh] w-full overflow-y-auto rounded-t-lg bg-white p-5 shadow-2xl sm:max-w-3xl sm:rounded-lg">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">
              Menu item
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
