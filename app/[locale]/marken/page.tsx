import type { Metadata } from "next";
import { BrandSearchGrid } from "@/components/brand-search-grid";
import { brands } from "@/lib/data/brands";
import { categories } from "@/lib/data/categories";
import { drinks, totalSugarGrams, uniqueProductRepresentatives } from "@/lib/data/drinks";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Marken",
  description: "Markenübersicht der Produktdatenbank: Proteinprodukte nach Hersteller öffnen und direkt in der Suche filtern.",
  path: "/de/marken",
});

export default function BrandsPage() {
  const uniqueByBrand = Object.fromEntries(
    brands.map((brand) => [brand.id, uniqueProductRepresentatives(drinks.filter((drink) => drink.brandId === brand.id))]),
  );
  const counts = Object.fromEntries(
    brands.map((brand) => [brand.id, uniqueByBrand[brand.id].length]),
  );
  const topDrinks = Object.fromEntries(
    brands.map((brand) => [
      brand.id,
      uniqueByBrand[brand.id]
        .sort((a, b) => (totalSugarGrams(b) ?? -1) - (totalSugarGrams(a) ?? -1))
        .slice(0, 3)
        .map((drink) => ({ id: drink.id, name: drink.name, sugar: totalSugarGrams(drink) })),
    ]),
  );
  const brandSearchData = Object.fromEntries(
    brands.map((brand) => {
      const brandDrinks = uniqueByBrand[brand.id];
      return [
        brand.id,
        {
          categories: Array.from(new Set(brandDrinks.map((drink) => drink.categoryId))),
          text: brandDrinks.map((drink) => drink.name).join(" "),
        },
      ];
    }),
  );

  return (
    <main className="mx-auto max-w-page px-4 py-10">
      <h1 className="text-4xl font-semibold tracking-tight">Marken</h1>
      <p className="mt-4 max-w-2xl leading-7 text-slate">
        Vergleiche Produktemarken nach Proteinwerten, Produktvarianten und Packungsgrößen. Jede Marke führt direkt zur gefilterten Produktesuche.
      </p>
      <BrandSearchGrid brands={brands} counts={counts} topDrinks={topDrinks} searchData={brandSearchData} categories={categories} />
    </main>
  );
}
