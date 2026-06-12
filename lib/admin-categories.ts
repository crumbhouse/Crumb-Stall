export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  foodItemCount: number;
  createdAt: string;
  updatedAt: string;
};

export type CategoryInput = {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
};

export async function createAdminCategory(input: CategoryInput) {
  const response = await fetch("/api/admin/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Category creation failed"));
  }

  return (await response.json()) as AdminCategory;
}

export async function updateAdminCategory(categoryId: string, input: CategoryInput) {
  const response = await fetch(`/api/admin/categories/${encodeURIComponent(categoryId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Category update failed"));
  }

  return (await response.json()) as AdminCategory;
}

export async function deactivateAdminCategory(categoryId: string) {
  const response = await fetch(`/api/admin/categories/${encodeURIComponent(categoryId)}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Category deactivation failed"));
  }

  return (await response.json()) as AdminCategory;
}

async function readErrorMessage(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as { message?: string };

    return typeof payload.message === "string" ? payload.message : fallback;
  } catch {
    return fallback;
  }
}
