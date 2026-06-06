import { AdminShell } from "@/components/admin-shell";
import { CategoryManager } from "@/components/admin/category-manager";
import { FoodManager } from "@/components/admin/food-manager";
import { getAdminCategories } from "@/lib/admin-categories-server";
import { getAdminFoods } from "@/lib/admin-foods-server";

export default async function AdminMenuPage() {
  const [categories, foods] = await Promise.all([
    getAdminCategories(),
    getAdminFoods(),
  ]);

  return (
    <AdminShell>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-orange-600">Catalog</p>
          <h1 className="mt-2 text-3xl font-black">Menu management</h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold text-stone-500">
            Create and organize the category groups customers see on the QR menu.
          </p>
        </div>
      </div>
      <CategoryManager categories={categories} />
      <FoodManager categories={categories} foods={foods} />
    </AdminShell>
  );
}
