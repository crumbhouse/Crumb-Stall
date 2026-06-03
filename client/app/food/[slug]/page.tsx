import Link from "next/link";
import Image from "next/image";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { CustomerNav } from "@/components/customer-nav";
import { FavoriteButton } from "@/components/favorite-button";
import { MobileBar } from "@/components/mobile-bar";
import { ReviewSection } from "@/components/review-section";
import { getFoodBySlug, getFoodImageUrl } from "@/lib/catalog";
import { getFavoriteIds } from "@/lib/favorites";
import { getFoodReviews } from "@/lib/reviews";

export default async function FoodDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [item, favorites, reviews] = await Promise.all([
    getFoodBySlug(slug),
    getFavoriteIds(),
    getFoodReviews(slug),
  ]);

  if (!item) {
    return (
      <main className="min-h-screen bg-stone-50 text-stone-950">
        <CustomerNav />
        <section className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="text-3xl font-black">Item not found</h1>
          <Link href="/menu" className="mt-6 inline-flex rounded-full bg-orange-600 px-5 py-3 font-black text-white">
            Back to menu
          </Link>
        </section>
      </main>
    );
  }
  const imageUrl = getFoodImageUrl(item);

  return (
    <main className="min-h-screen bg-[#f6f6f4] pb-24 text-[#171717]">
      <CustomerNav />
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
        <div className="overflow-hidden rounded-lg border border-[#e8e8e3] bg-white shadow-sm">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={item.name}
              width={900}
              height={675}
              className="aspect-[4/3] w-full object-cover"
              priority
            />
          ) : null}
        </div>
        <aside className="h-fit rounded-lg border border-[#e8e8e3] bg-white p-6 shadow-sm">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[#e23744]">
            {item.category.name}
          </p>
          <h1 className="mt-3 text-4xl font-black leading-tight">{item.name}</h1>
          <div className="relative mt-4 h-10">
            <FavoriteButton
              slug={item.slug}
              initialIsFavorite={favorites.slugs.includes(item.slug)}
            />
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm font-bold">
            <span className="rounded-md bg-[#fff8db] px-2 py-1 text-[#8a5a00]">★ {item.ratingAverage}</span>
            <span className="text-[#646464]">{item.ratingCount} ratings</span>
            <span className="rounded-md bg-[#ecfdf3] px-2 py-1 text-[#166534]">{item.type === "VEG" ? "Veg" : "Non-veg"}</span>
          </div>
          <p className="mt-4 leading-7 text-[#646464]">{item.description}</p>
          <div className="mt-6 flex items-center gap-3">
            <p className="text-3xl font-black">Rs {item.finalPrice}</p>
            {item.discountPrice ? <p className="font-bold text-[#8b8b8b] line-through">Rs {item.price}</p> : null}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span key={tag} className="rounded-md bg-[#f1f1ee] px-3 py-1 text-sm font-bold text-[#555]">
                {tag}
              </span>
            ))}
          </div>
          <AddToCartButton
            item={item}
            className="mt-8 flex w-full justify-center rounded-md bg-[#e23744] px-5 py-4 text-base font-black text-white transition hover:bg-[#b91c2b]"
          >
            Add to cart
          </AddToCartButton>
          <Link
            href="/menu"
            className="mt-3 flex w-full justify-center rounded-md border border-[#e8e8e3] px-5 py-3 text-sm font-black text-[#171717]"
          >
            Back to menu
          </Link>
        </aside>
      </section>
      <ReviewSection slug={item.slug} initialReviews={reviews} />
      <MobileBar />
    </main>
  );
}
