import { CustomerNav } from "@/components/customer-nav";
import { FoodCard } from "@/components/food-card";
import { MobileBar } from "@/components/mobile-bar";
import { fallbackFoods } from "@/lib/catalog";

export default function FavoritesPage() {
  return (
    <main className="min-h-screen bg-stone-50 pb-20 text-stone-950">
      <CustomerNav />
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black">Favorites</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fallbackFoods.slice(0, 3).map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      </section>
      <MobileBar />
    </main>
  );
}
