"use client";

import Link from "next/link";
import { ChevronDown, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { Brand } from "@/lib/data/brands";
import type { DrinkCategory } from "@/lib/data/categories";

type BrandSearchGridProps = {
  brands: Brand[];
  counts: Record<string, number>;
  topDrinks: Record<string, { id: string; name: string }[]>;
  searchData: Record<string, { categories: string[]; text: string }>;
  categories: DrinkCategory[];
};

export function BrandSearchGrid({ brands, counts, topDrinks, searchData, categories }: BrandSearchGridProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const filteredBrands = useMemo(() => {
    const value = query.trim().toLowerCase();

    return brands.filter((brand) => {
      const data = searchData[brand.id];
      const matchesQuery = !value || `${brand.name} ${brand.note} ${data?.text ?? ""}`.toLowerCase().includes(value);
      const matchesCategory = category === "all" || data?.categories.includes(category);
      return matchesQuery && matchesCategory;
    });
  }, [brands, category, query, searchData]);

  const categoryOptions = useMemo(
    () => categories.filter((item) => brands.some((brand) => searchData[brand.id]?.categories.includes(item.id))),
    [brands, categories, searchData],
  );

  return (
    <section className="mt-8">
      <div className="grid gap-3 rounded-lg border border-ash bg-mist p-3 md:grid-cols-[1fr_260px_auto]">
        <label className="flex h-11 min-w-0 items-center gap-2 rounded-md border border-ash bg-paper px-3 transition focus-within:border-marigold">
          <Search size={16} strokeWidth={1.75} aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Marke oder Produkt suchen"
            aria-label="Marke oder Produkt suchen"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate"
          />
        </label>
        <label className="relative flex min-w-0 items-center">
          <span className="sr-only">Kategorie filtern</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="focus-ring h-11 w-full appearance-none rounded-md border border-ash bg-paper px-3 pr-9 text-sm"
          >
            <option value="all">Alle Kategorien</option>
            {categoryOptions.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          <ChevronDown size={16} strokeWidth={1.75} className="pointer-events-none absolute right-3 text-slate" aria-hidden="true" />
        </label>
        <p className="flex h-11 items-center rounded-md border border-ash bg-paper px-3 text-sm text-slate">
          {filteredBrands.length} Marken
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        {filteredBrands.map((brand) => {
          const count = counts[brand.id] ?? 0;
          const products = topDrinks[brand.id] ?? [];
          const remaining = Math.max(0, count - products.length);
          const actionLabel = remaining > 0 ? `${remaining} weitere` : "Produkte ansehen";

          return (
          <article key={brand.id} className="flex min-h-[236px] flex-col rounded-lg border border-ash bg-mist p-4">
            <div>
              <h2 className="font-medium">{brand.name}</h2>
              <p className="mt-1 text-sm text-slate">{brand.note}</p>
            </div>
            {!!products.length && (
              <div className="mt-4 flex flex-1 flex-col border-t border-ash pt-3">
                <p className="text-xs font-medium text-slate">Produkte</p>
                <div className="mb-5 mt-2 flex flex-col items-start gap-2">
                {products.map((drink) => (
                  <Link key={drink.id} href={`/de/produkte/${drink.id}`} className="focus-ring max-w-full truncate rounded-md bg-paper px-2.5 py-1.5 text-sm leading-5 hover:bg-cream">
                    {drink.name}
                  </Link>
                ))}
                </div>
                <Link href={`/de/produkte?brand=${brand.id}`} className="focus-ring mt-auto inline-flex w-fit rounded-md border border-ink bg-paper px-2.5 py-1.5 text-sm leading-5 hover:bg-ink hover:text-white dark:hover:text-black">
                  {actionLabel}
                </Link>
              </div>
            )}
          </article>
          );
        })}
      </div>

      {!filteredBrands.length && (
        <p className="mt-5 rounded-lg border border-ash bg-mist p-4 text-sm text-slate">
          Keine Marke zu "{query}" gefunden.
        </p>
      )}
    </section>
  );
}
