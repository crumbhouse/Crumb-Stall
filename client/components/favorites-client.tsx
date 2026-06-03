"use client";

import { useState } from "react";
import { FoodCard } from "@/components/food-card";
import type { FoodItem } from "@/lib/catalog";

export function FavoritesClient({ initialItems }: { initialItems: FoodItem[] }) {
  const [items, setItems] = useState(initialItems);

  if (items.length === 0) {
    return (
      <div className="mt-6 rounded-lg border border-dashed border-[#d7d7cf] bg-white p-8 text-center shadow-sm">
        <p className="text-2xl font-black">No saved items yet</p>
        <p className="mt-2 text-sm font-semibold text-[#646464]">
          Tap the heart on menu items to keep your regular orders here.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <FoodCard
          key={item.id}
          item={item}
          isFavorite
          onFavoriteChange={(slug, isFavorite) => {
            if (!isFavorite) {
              setItems((currentItems) => currentItems.filter((currentItem) => currentItem.slug !== slug));
            }
          }}
        />
      ))}
    </div>
  );
}
