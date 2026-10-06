import type { Metadata } from "next";
import Link from "next/link";
import ui from "@/components/ui/ui.module.css";
import { brands } from "@/lib/data/brands";
import { categoryById } from "@/lib/data/categories";
import { proteinPer100 } from "@/lib/data/products";
import { brandProducts } from "@/lib/listing";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Proteinmarken im Vergleich",
  description: "Alle Marken der Datenbank mit Anzahl der Produkte, Kategorien und Spanne beim Protein pro 100 g, von ESN und More bis Ehrmann und dm Sportness.",
  path: "/de/marken",
});

const format = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 });

export default function BrandsPage() {
  const rows = brands
    .map((brand) => {
      const items = brandProducts(brand.id);
      const values = items.map(proteinPer100);
      const categoryNames = Array.from(new Set(items.map((item) => categoryById[item.categoryId]?.name ?? ""))).filter(Boolean);
      return { brand, count: items.length, min: Math.min(...values), max: Math.max(...values), categoryNames };
    })
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count || a.brand.name.localeCompare(b.brand.name, "de"));
  const total = rows.reduce((sum, row) => sum + row.count, 0);

  return (
    <main className={ui.page}>
      <header className={ui.pageHead}>
        <h1>Proteinmarken im Vergleich</h1>
        <p className={ui.lead}>{rows.length} Marken mit {total} Produkten. Jede Marke hat eine eigene Seite mit allen Produkten, sortierbar nach Protein, Kalorien und Zucker.</p>
      </header>
      <section className={ui.section} aria-label="Alle Marken">
        <div className={ui.tableCard}>
          <table className={ui.table}>
            <thead>
              <tr>
                <th scope="col">Marke</th>
                <th scope="col">Produkte</th>
                <th scope="col">Protein pro 100 g/ml</th>
                <th scope="col" className={ui.hideMobile}>Kategorien</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.brand.id}>
                  <th scope="row"><Link href={`/de/marken/${row.brand.id}`}>{row.brand.name}</Link></th>
                  <td>{row.count}</td>
                  <td>{row.min === row.max ? `${format.format(row.min)} g` : `${format.format(row.min)}–${format.format(row.max)} g`}</td>
                  <td className={ui.hideMobile}><small>{row.categoryNames.join(", ")}</small></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
