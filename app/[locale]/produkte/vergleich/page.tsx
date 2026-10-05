import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { ProductComparisonTool } from "@/components/product-comparison-tool";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Proteinprodukte vergleichen",
  description: "Vergleiche bis zu vier Proteinprodukte nach Protein, Energie, Packungsgröße und weiteren Nährwerten.",
  path: "/de/produkte/vergleich",
});

export default function ProductComparisonPage() {
  return (
    <main className="mx-auto max-w-page px-4 py-10 md:py-14">
      <Link href="/de/produkte" className="focus-ring inline-flex items-center gap-2 rounded-md text-sm text-slate hover:text-ink">
        <ArrowLeft size={17} strokeWidth={1.75} aria-hidden="true" />
        Zur Produktdatenbank
      </Link>
      <header className="mb-10 mt-8 max-w-4xl">
        <h1 className="text-4xl font-semibold leading-[1.02] tracking-[-0.02em] md:text-6xl">Proteinprodukte im direkten Vergleich</h1>
        <p className="mt-5 max-w-2xl leading-7 text-slate">Wähle bis zu vier Produkte. Protein, Energie und weitere Nährwerte stehen pro 100 g/ml und pro Packung nebeneinander.</p>
      </header>
      <Suspense fallback={<div className="border-y border-ash py-10 text-sm text-slate">Vergleich wird geladen...</div>}>
        <ProductComparisonTool />
      </Suspense>
    </main>
  );
}
