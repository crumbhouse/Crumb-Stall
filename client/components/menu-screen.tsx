import { MenuClient } from "@/components/menu-client";
import { getMenuCatalog } from "@/lib/catalog";

export async function MenuScreen() {
  const { categories, foods } = await getMenuCatalog();
  return <MenuClient categories={categories} foods={foods} />;
}
