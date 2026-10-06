import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProductExplorer } from "@/components/product-explorer";
import { brandById, brands } from "@/lib/data/brands";
import { categories } from "@/lib/data/categories";
import { products, proteinPer100, uniqueProductRepresentatives, type Product } from "@/lib/data/products";
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
      <Suspense fallback={<ExplorerFallback products={pageProducts} />}>
        <ProductExplorer items={explorerItems} brands={brands.map(({ id, name }) => ({ id, name }))} categories={categories.map(({ id, name }) => ({ id, name }))} />
      </Suspense>
    </main>
  );
}

// Server HTML before the explorer hydrates: the explorer's first page (protein per 100 g, highest first).
function ExplorerFallback({ products: pageProducts }: { products: Product[] }) {
  const top = uniqueProductRepresentatives(pageProducts).sort((a, b) => proteinPer100(b) - proteinPer100(a)).slice(0, 15);
  const format = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 });
  return (
    <ol className="divide-y divide-ash border-y border-ash text-sm">
      {top.map((product) => (
        <li key={product.id} className="flex items-baseline justify-between gap-4 py-3">
          <Link href={productPageHref(product)} className="focus-ring min-w-0 truncate rounded-md hover:underline">
            {brandById[product.brandId]?.name} {product.name}
          </Link>
          <span className="shrink-0 tabular-nums text-slate">{format.format(proteinPer100(product))} g / 100 {product.unit}</span>
        </li>
      ))}
    </ol>
  );
}
