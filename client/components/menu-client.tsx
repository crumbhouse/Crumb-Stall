"use client";

import { useMemo, useState } from "react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { CartSummaryBar } from "@/components/cart-summary-bar";
import { CustomerNav } from "@/components/customer-nav";
import { FoodCard } from "@/components/food-card";
import { MobileBar } from "@/components/mobile-bar";
import type { Category, FoodItem } from "@/lib/catalog";

type ActiveFilter = "all" | "recommended" | "combos" | "under-100" | "top-rated" | "veg";

const quickFilters: Array<{ id: ActiveFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "recommended", label: "Recommended" },
  { id: "combos", label: "Combos" },
  { id: "under-100", label: "Under Rs 100" },
  { id: "top-rated", label: "Top rated" },
  { id: "veg", label: "Veg only" },
];

export function MenuClient({ categories, foods }: { categories: Category[]; foods: FoodItem[] }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");

  const featured = foods.filter((item) => item.isFeatured);
  const combo = foods.find((item) => item.slug === "burger-coffee-combo") ?? featured[0];

  const filteredFoods = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return foods.filter((item) => {
      const matchesSearch =
        normalizedQuery.length === 0 ||
        [
          item.name,
          item.description,
          item.category.name,
          item.category.slug,
          ...item.tags,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesCategory =
        activeCategory === "all" || item.category.slug === activeCategory;

      const matchesQuickFilter =
        activeFilter === "all" ||
        (activeFilter === "recommended" && item.isFeatured) ||
        (activeFilter === "combos" && item.category.slug === "combos") ||
        (activeFilter === "under-100" && item.finalPrice <= 100) ||
        (activeFilter === "top-rated" && item.ratingAverage >= 4.5) ||
        (activeFilter === "veg" && item.type === "VEG");

      return matchesSearch && matchesCategory && matchesQuickFilter;
    });
  }, [activeCategory, activeFilter, foods, query]);

  const hasActiveFilters = query.trim() !== "" || activeCategory !== "all" || activeFilter !== "all";
  const activeCategoryName =
    activeCategory === "all"
      ? "All categories"
      : categories.find((category) => category.slug === activeCategory)?.name ?? "Category";

  function clearFilters() {
    setQuery("");
    setActiveCategory("all");
    setActiveFilter("all");
  }

  return (
    <main className="min-h-screen bg-[#f6f6f4] pb-28 text-[#171717]">
      <CustomerNav />

      <section className="border-b border-[#e8e8e3] bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8 lg:py-8">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-[#ecfdf3] px-3 py-1 text-xs font-black text-[#166534]">
                Open now
              </span>
              <span className="rounded-md bg-[#f1f1ee] px-3 py-1 text-xs font-bold text-[#555]">
                Pickup in 12-18 min
              </span>
              <span className="rounded-md bg-[#fff0f2] px-3 py-1 text-xs font-bold text-[#b91c2b]">
                WELCOME10 active
              </span>
            </div>

            <div className="mt-5 max-w-3xl">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-[#e23744]">
                Crumb Stall menu
              </p>
              <h1 className="mt-2 text-4xl font-black tracking-tight text-[#171717] sm:text-5xl lg:text-6xl">
                Fresh food, ready when your break starts.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#646464]">
                Scan the QR, choose your food, pay online, and show the pickup OTP at the counter.
              </p>
            </div>

            <form
              className="mt-6 flex max-w-3xl gap-3 rounded-lg border border-[#e8e8e3] bg-[#f9f9f7] p-2"
              onSubmit={(event) => event.preventDefault()}
            >
              <label htmlFor="menu-search" className="sr-only">
                Search menu
              </label>
              <input
                id="menu-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="min-w-0 flex-1 bg-transparent px-3 py-3 text-base font-semibold text-[#171717] outline-none placeholder:text-[#8b8b8b]"
                placeholder="Search burger, momos, coffee..."
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="rounded-md border border-[#e8e8e3] bg-white px-4 py-3 text-sm font-black text-[#555]"
                >
                  Clear
                </button>
              ) : null}
            </form>

            <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
              {quickFilters.map((filter) => {
                const isActive = activeFilter === filter.id;

                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setActiveFilter(filter.id)}
                    className={`shrink-0 rounded-full border px-4 py-2 text-sm font-black shadow-sm transition ${
                      isActive
                        ? "border-[#e23744] bg-[#e23744] text-white"
                        : "border-[#e8e8e3] bg-white text-[#4b4b4b] hover:border-[#e23744] hover:text-[#e23744]"
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="overflow-hidden rounded-lg bg-[#171717] text-white shadow-[0_18px_50px_rgba(20,20,20,0.18)]">
            <div className="p-5">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-[#ffb8bf]">
                Today&apos;s crowd favorite
              </p>
              <h2 className="mt-2 text-3xl font-black leading-tight">
                {combo?.name ?? "Chef recommended combo"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/75">
                {combo?.description ??
                  "A filling snack combo for rushed class breaks. Best value before the lunch queue."}
              </p>
              <div className="mt-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white/60">Price</p>
                  <p className="text-3xl font-black">Rs {combo?.finalPrice ?? 139}</p>
                </div>
                {combo ? (
                  <AddToCartButton
                    item={combo}
                    className="rounded-md bg-white px-4 py-3 text-sm font-black text-[#171717]"
                  >
                    Add combo
                  </AddToCartButton>
                ) : null}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#e23744]">
              Categories
            </p>
            <h2 className="mt-1 text-2xl font-black">Order by craving</h2>
          </div>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-full border border-[#e8e8e3] bg-white px-4 py-2 text-sm font-black text-[#555]"
            >
              Reset
            </button>
          ) : null}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`rounded-lg border p-4 text-left shadow-sm transition hover:-translate-y-0.5 ${
              activeCategory === "all"
                ? "border-[#e23744] bg-[#fff0f2]"
                : "border-[#e8e8e3] bg-white hover:border-[#e23744]"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-black">All items</h3>
              <span className="rounded-md bg-[#f1f1ee] px-2 py-1 text-xs font-black text-[#555]">
                {foods.length}
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm leading-5 text-[#646464]">
              Browse the full Crumb Stall menu.
            </p>
          </button>

          {categories.map((category) => {
            const isActive = activeCategory === category.slug;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.slug)}
                className={`rounded-lg border p-4 text-left shadow-sm transition hover:-translate-y-0.5 ${
                  isActive
                    ? "border-[#e23744] bg-[#fff0f2]"
                    : "border-[#e8e8e3] bg-white hover:border-[#e23744]"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-black">{category.name}</h3>
                  <span className="rounded-md bg-[#f1f1ee] px-2 py-1 text-xs font-black text-[#555]">
                    {category.foodItemCount}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm leading-5 text-[#646464]">
                  {category.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {!hasActiveFilters ? (
        <section className="mx-auto max-w-7xl px-4 pb-2 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-[#e23744]">
                Recommended
              </p>
              <h2 className="mt-1 text-2xl font-black">Popular right now</h2>
            </div>
            <a href="#all-items" className="hidden text-sm font-black text-[#e23744] sm:block">
              See full menu
            </a>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      ) : null}

      <section id="all-items" className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#e23744]">
              Menu results
            </p>
            <h2 className="mt-1 text-2xl font-black">{activeCategoryName}</h2>
            <p className="mt-1 text-sm font-semibold text-[#646464]">
              {filteredFoods.length} {filteredFoods.length === 1 ? "item" : "items"} match your
              selection
            </p>
          </div>
        </div>

        {filteredFoods.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#d7d7cf] bg-white p-8 text-center">
            <p className="text-2xl font-black">No matching items</p>
            <p className="mt-2 text-sm font-semibold text-[#646464]">
              Try clearing the search or choosing a different category.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 rounded-md bg-[#e23744] px-5 py-3 font-black text-white"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFoods.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      <CartSummaryBar />

      <MobileBar />
    </main>
  );
}
