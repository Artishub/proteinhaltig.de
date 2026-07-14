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
    <main className="mx-auto max-w-page px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mb-8 max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Proteinwerte vergleichen.</h1>
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
      <h2 className="text-2xl font-semibold tracking-tight">Alle Produktseiten</h2>
      <p className="mt-3 max-w-2xl leading-7 text-slate">
        Direkte Links zu allen Detailseiten. So bleiben auch Varianten ohne Filter erreichbar.
      </p>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {categories.map((category) => {
          const items = drinks
            .filter((drink) => drink.categoryId === category.id)
            .sort((a, b) => {
              const brandCompare = (brandById[a.brandId]?.name ?? "").localeCompare(brandById[b.brandId]?.name ?? "", "de");
              return brandCompare || a.name.localeCompare(b.name, "de");
            });

          if (!items.length) return null;

          return (
            <section key={category.id} className="min-w-0">
              <h3 className="text-lg font-semibold tracking-tight">{categoryById[category.id]?.name ?? category.name}</h3>
              <ul className="mt-3 grid gap-2 text-sm">
                {items.map((drink) => (
                  <li key={drink.id}>
                    <Link href={`/de/produkte/${drink.id}`} className="focus-ring inline-flex max-w-full rounded-md text-slate underline decoration-ash underline-offset-4 hover:text-ink hover:decoration-marigold">
                      <span className="truncate">{brandById[drink.brandId]?.name ?? "Marke"} · {drink.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </section>
  );
}
