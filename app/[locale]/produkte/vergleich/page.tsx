import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { ProductComparisonTool, type CompareProduct } from "@/components/product-comparison-tool";
import { brandById } from "@/lib/data/brands";
import { categoryById } from "@/lib/data/categories";
import { products } from "@/lib/data/products";
import { productPageHref } from "@/lib/page-routing";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Proteinprodukte vergleichen",
  description: "Vergleiche bis zu vier Proteinprodukte nach Protein, Energie, Packungsgröße und weiteren Nährwerten.",
  path: "/de/produkte/vergleich",
});

function compareOptions(): CompareProduct[] {
  return products
    .map((product) => ({ ...product, href: productPageHref(product), brandName: brandById[product.brandId]?.name ?? "", categoryName: categoryById[product.categoryId]?.name ?? "Produkt" }))
    .sort((a, b) => a.brandName.localeCompare(b.brandName, "de") || a.name.localeCompare(b.name, "de") || (a.packageSize ?? 0) - (b.packageSize ?? 0));
}

export default function ProductComparisonPage() {
  return (
    <main className="mx-auto max-w-page px-4 py-10 md:py-14">
      <Link href="/de/produkte" className="focus-ring inline-flex items-center gap-2 rounded-md text-sm text-slate hover:text-ink">
        <ArrowLeft size={17} strokeWidth={1.75} aria-hidden="true" />
        Zur Produktdatenbank
      </Link>
      <header className="mb-10 mt-8 max-w-4xl">
        <h1 className="text-4xl font-semibold leading-[1.02] tracking-[-0.02em] md:text-6xl">Proteinprodukte im direkten Vergleich</h1>
        <p className="mt-5 max-w-2xl leading-7 text-slate">Wähle bis zu vier Produkte. Protein pro 100 g, pro Portion und pro 100 kcal, dazu Kalorien, Zucker, Fett und Salz nebeneinander.</p>
      </header>
      <Suspense fallback={<div className="border-y border-ash py-10 text-sm text-slate">Vergleich wird geladen...</div>}>
        <ProductComparisonTool options={compareOptions()} />
      </Suspense>
    </main>
  );
}
