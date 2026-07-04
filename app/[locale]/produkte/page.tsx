import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductExplorer } from "@/components/product-explorer";

export const metadata: Metadata = {
  title: "Produktdatenbank",
  description: "Suche und filtere Proteinprodukte nach Marke, Kategorie, Packungsgröße und Proteinwerten.",
  alternates: {
    canonical: "/de/produkte",
  },
};

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
    </main>
  );
}
