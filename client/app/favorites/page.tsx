import { CustomerNav } from "@/components/customer-nav";
import { FavoritesClient } from "@/components/favorites-client";
import { MobileBar } from "@/components/mobile-bar";
import { getFavorites } from "@/lib/favorites";

export default async function FavoritesPage() {
  const favorites = await getFavorites();

  return (
    <main className="min-h-screen bg-[#f6f6f4] pb-20 text-[#171717]">
      <CustomerNav />
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-[#d21f32]">
          Saved items
        </p>
        <h1 className="mt-2 text-3xl font-black">Your favorites</h1>
        <p className="mt-2 max-w-2xl text-sm font-semibold text-[#646464]">
          Keep your usual snacks close and add them to cart quickly before the break rush.
        </p>
        <FavoritesClient initialItems={favorites.data} />
      </section>
      <MobileBar />
    </main>
  );
}
