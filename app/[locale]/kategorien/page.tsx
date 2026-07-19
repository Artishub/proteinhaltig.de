import type { Metadata } from "next";
import Link from "next/link";
import { categories } from "@/lib/data/categories";
import { drinks, totalProteinGrams, uniqueProductRepresentatives } from "@/lib/data/drinks";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Kategorien",
  description: "Proteinprodukt-Kategorien von Riegeln bis Skyr, Pudding, Drinks und Pulver.",
  path: "/de/kategorien",
});

export default function CategoriesPage() {
  return (
    <main className="mx-auto max-w-page px-4 py-10">
      <h1 className="text-4xl font-semibold tracking-[-0.02em]">Kategorien</h1>
      <p className="mt-4 max-w-2xl leading-7 text-slate">
        Entdecke Proteinwerte nach Produkttyp: Riegel, Joghurt, Skyr, Pudding, Drinks, Pulver und pflanzliche Proteinprodukte.
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => {
          const categoryDrinks = drinks.filter((drink) => drink.categoryId === category.id);
          const topDrinks = uniqueProductRepresentatives(categoryDrinks)
            .sort((a, b) => (totalProteinGrams(b) ?? -1) - (totalProteinGrams(a) ?? -1))
            .slice(0, 2);

          return (
          <article key={category.id} className="rounded-lg border border-ash bg-mist p-4">
            <h2 className="font-medium">{category.name}</h2>
            <p className="mt-2 text-sm leading-6 text-slate">{category.description}</p>
            <p className="mt-4 text-sm tabular-nums">{categoryDrinks.length} Einträge</p>
            <Link href={`/de/produkte?category=${category.id}`} className="focus-ring mt-3 inline-flex rounded-md text-sm underline decoration-ash underline-offset-4 hover:decoration-marigold">
              Kategorie filtern
            </Link>
            {!!topDrinks.length && (
              <div className="mt-4 border-t border-ash pt-3">
                <p className="text-xs font-medium text-slate">Produkte</p>
                <div className="mt-2 flex flex-wrap gap-2">
                {topDrinks.map((drink) => (
                  <Link key={drink.id} href={`/de/produkte/${drink.id}`} className="focus-ring rounded-md bg-paper px-2.5 py-1.5 text-sm leading-5 hover:bg-cream">
                    {drink.name}
                  </Link>
                ))}
                </div>
              </div>
            )}
          </article>
          );
        })}
      </div>
    </main>
  );
}
