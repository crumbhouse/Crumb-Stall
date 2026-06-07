import Link from "next/link";
import Image from "next/image";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { FavoriteButton } from "@/components/favorite-button";
import { getFoodImageUrl, type FoodItem } from "@/lib/catalog";

export function FoodCard({
  item,
  isFavorite = false,
  onFavoriteChange,
}: {
  item: FoodItem;
  isFavorite?: boolean;
  onFavoriteChange?: (slug: string, isFavorite: boolean) => void;
}) {
  const imageUrl = getFoodImageUrl(item);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-[#e8e8e3] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(20,20,20,0.08)]">
      <div className="relative">
        <Link href={`/food/${item.slug}`} className="block">
          <div className="aspect-[4/3] bg-[#f1f1ee]">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={item.name}
                width={600}
                height={450}
                unoptimized
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-4xl font-black text-[#d6d6cf]">
                {item.name.slice(0, 2)}
              </div>
            )}
            {item.discountPrice ? (
              <span className="absolute left-3 top-3 rounded-md bg-[#171717] px-2.5 py-1 text-xs font-black text-white">
                Save Rs {item.price - item.discountPrice}
              </span>
            ) : null}
          </div>
        </Link>
        <FavoriteButton
          slug={item.slug}
          initialIsFavorite={isFavorite}
          onChange={(nextValue) => onFavoriteChange?.(item.slug, nextValue)}
          className="absolute right-3 top-3 z-10"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#d21f32]">
              {item.category.name}
            </p>
            <Link href={`/food/${item.slug}`} className="mt-1 line-clamp-2 block min-h-12 text-lg font-black leading-6 text-[#171717]">
              {item.name}
            </Link>
          </div>
          <span className="rounded-md border border-[#b7e4c7] bg-[#ecfdf3] px-2 py-1 text-xs font-black text-[#166534]">
            {item.type === "VEG" ? "Veg" : "Non-veg"}
          </span>
        </div>

        <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-[#646464]">
          {item.description}
        </p>

        <div className="mt-3 flex items-center gap-2 text-sm font-bold text-[#4b4b4b]">
          <span className="rounded-md bg-[#fff8db] px-2 py-1 text-[#8a5a00]">★ {item.ratingAverage}</span>
          <span>{item.ratingCount} ratings</span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <p className="text-lg font-black text-[#171717]">Rs {item.finalPrice}</p>
            {item.discountPrice ? (
              <p className="text-xs font-semibold text-[#666666] line-through">Rs {item.price}</p>
            ) : null}
          </div>
          <AddToCartButton item={item} />
        </div>
      </div>
    </article>
  );
}
