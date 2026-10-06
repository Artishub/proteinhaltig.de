import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProductExplorer } from "@/components/product-explorer";
import { brandById, brands } from "@/lib/data/brands";
import { categories, categoryById } from "@/lib/data/categories";
import { products } from "@/lib/data/products";
import { isProductPage, productPageHref } from "@/lib/page-routing";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Produktdatenbank",
  description: "Suche und filtere Proteinprodukte nach Marke, Kategorie, Packungsgröße und Proteinwerten.",
  path: "/de/produkte",
});

export default function ProductsPage() {
  const pageProducts = products.filter(isProductPage);
  const pageCount = pageProducts.length;
  const explorerItems = pageProducts.map((product) => ({ ...product, href: productPageHref(product) }));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Proteinhaltig.de Produktdatenbank",
    description: "Proteinwerte von Proteinprodukten in Deutschland mit Quelle und Prüfdatum.",
    inLanguage: "de",
  };

  return (
    <main className="mx-auto max-w-page px-4 py-10 md:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mb-8 max-w-3xl">
        <h1 className="text-4xl font-semibold leading-[1.02] tracking-[-0.02em] md:text-6xl">Proteinprodukte vergleichen</h1>
        <p className="mt-4 leading-7 text-slate">
          {pageCount} Produkte nach Protein pro 100 g, pro Portion und pro 100 kcal. Filtere nach Marke, Kategorie und Packung.
        </p>
      </div>
      <Suspense fallback={<div className="border-t border-ash py-6 text-sm text-slate">Produkte werden geladen...</div>}>
        <ProductExplorer items={explorerItems} brands={brands.map(({ id, name }) => ({ id, name }))} categories={categories.map(({ id, name }) => ({ id, name }))} />
      </Suspense>
      <ProductDirectory />
    </main>
  );
}

function ProductDirectory() {
  return (
    <section className="mt-12 border-t border-ash pt-8">
      <h2 className="text-2xl font-medium tracking-[-0.02em]">Alle Produkte nach Kategorie</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate">Öffne eine Kategorie und rufe jedes Produkt direkt auf.</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {categories.map((category) => {
          const items = products
            .filter((product) => product.categoryId === category.id && isProductPage(product))
            .sort((a, b) => {
              const brandCompare = (brandById[a.brandId]?.name ?? "").localeCompare(brandById[b.brandId]?.name ?? "", "de");
              return brandCompare || a.name.localeCompare(b.name, "de");
            });

          if (!items.length) return null;

          return (
            <details key={category.id} className="rounded-lg border border-ash bg-mist px-4 py-3">
              <summary className="focus-ring cursor-pointer rounded-md font-medium">
                {categoryById[category.id]?.name ?? category.name} <span className="font-normal text-slate">({items.length})</span>
              </summary>
              <ul className="mt-4 grid gap-x-5 gap-y-2 text-sm sm:grid-cols-2">
                {items.map((product) => (
                  <li key={product.id}>
                    <Link href={productPageHref(product)} className="focus-ring inline-flex max-w-full rounded-md underline decoration-ash underline-offset-4 hover:decoration-marigold">
                      <span className="truncate">{brandById[product.brandId]?.name ?? "Marke"} · {product.name}</span>
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
