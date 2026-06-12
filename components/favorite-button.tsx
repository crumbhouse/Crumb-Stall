"use client";

import { useState, useTransition } from "react";
import { addFavorite, removeFavorite } from "@/lib/favorites";

export function FavoriteButton({
  slug,
  initialIsFavorite = false,
  onChange,
  className = "",
}: {
  slug: string;
  initialIsFavorite?: boolean;
  onChange?: (isFavorite: boolean) => void;
  className?: string;
}) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isPending, startTransition] = useTransition();

  function toggleFavorite() {
    const nextValue = !isFavorite;
    setIsFavorite(nextValue);
    onChange?.(nextValue);

    startTransition(async () => {
      try {
        if (nextValue) {
          await addFavorite(slug);
        } else {
          await removeFavorite(slug);
        }
      } catch {
        setIsFavorite(!nextValue);
        onChange?.(!nextValue);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      disabled={isPending}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? "Remove from saved items" : "Save item"}
      title={isFavorite ? "Remove from saved" : "Save item"}
      className={`flex size-10 items-center justify-center rounded-full border text-lg font-black shadow-sm transition ${
        isFavorite
          ? "border-[#d21f32] bg-[#d21f32] text-white"
          : "border-white/70 bg-white/95 text-[#d21f32] hover:bg-[#fff0f2]"
      } ${isPending ? "opacity-70" : ""} ${className}`}
    >
      {isFavorite ? "♥" : "♡"}
    </button>
  );
}
