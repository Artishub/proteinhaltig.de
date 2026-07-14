import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProductExplorer } from "@/components/product-explorer";
import { brandById } from "@/lib/data/brands";
import { categories, categoryById } from "@/lib/data/categories";
import { drinks } from "@/lib/data/drinks";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Produktdatenbank",
  description: "Suche und filtere Proteinprodukte nach Marke, Kategorie, Packungsgröße und Proteinwerten.",
  path: "/de/produkte",
});

export default function ProductsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Proteinhaltig.de Produktdatenbank",
    description: "Lokale MVP-Datenbank zu Proteinwerten in Produkten in Deutschland.",
    inLanguage: "de",
  };

  return (
    <main className="mx-auto max-w-page px-4 py-10 md:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mb-10 max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate">Produktdatenbank</p>
        <h1 className="mt-3 text-5xl font-semibold leading-[.94] tracking-[-0.06em] md:text-6xl">Proteinwerte vergleichen.</h1>
        <p className="mt-4 leading-7 text-slate">
          <span className="block">Filtere nach Marke, Kategorie, Packung und Protein.</span>
          <span className="block">Alle Berechnungen passieren lokal im Browser.</span>
        </p>
      </div>
      <Suspense fallback={<div className="border-t border-ash py-6 text-sm text-slate">Produkte werden geladen...</div>}>
        <ProductExplorer />
      </Suspense>
      <ProductDirectory />
    </main>
  );
}

function ProductDirectory() {
  return (
    <section className="mt-12 border-t border-ash pt-8">
      <h2 className="text-2xl font-semibold tracking-tight">Alle Produkte nach Kategorie</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate">Öffne eine Kategorie und rufe jedes Produkt direkt auf.</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {categories.map((category) => {
          const items = drinks
            .filter((drink) => drink.categoryId === category.id)
            .sort((a, b) => {
              const brandCompare = (brandById[a.brandId]?.name ?? "").localeCompare(brandById[b.brandId]?.name ?? "", "de");
              return brandCompare || a.name.localeCompare(b.name, "de");
            });

          if (!items.length) return null;

          return (
            <details key={category.id} className="rounded-lg border border-ash bg-paper px-4 py-3">
              <summary className="focus-ring cursor-pointer rounded-md font-semibold">
                {categoryById[category.id]?.name ?? category.name} <span className="font-normal text-slate">({items.length})</span>
              </summary>
              <ul className="mt-4 grid gap-x-5 gap-y-2 text-sm sm:grid-cols-2">
                {items.map((drink) => (
                  <li key={drink.id}>
                    <Link href={`/de/produkte/${drink.id}`} className="focus-ring inline-flex max-w-full rounded-md underline decoration-ash underline-offset-4 hover:decoration-marigold">
                      <span className="truncate">{brandById[drink.brandId]?.name ?? "Marke"} · {drink.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          );
        })}
      </div>
    </section>
  );
}
