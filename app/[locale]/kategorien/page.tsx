import type { Metadata } from "next";
import Link from "next/link";
import ui from "@/components/ui/ui.module.css";
import { categoryRows } from "@/lib/home-data";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Proteinprodukte nach Kategorie",
  description: "Proteinriegel, Pulver, Drinks, Skyr, Quark, Pudding und pflanzliches Protein im Vergleich: Durchschnitt und Spanne pro 100 g und pro 100 kcal.",
  path: "/de/kategorien",
});

const format = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 });

export default function CategoriesPage() {
  const rows = categoryRows();
  const maxRange = Math.max(...rows.map((row) => row.max));

  return (
    <main className={ui.page}>
      <header className={ui.pageHead}>
        <h1>Proteinprodukte nach Kategorie</h1>
        <p className={ui.lead}>Durchschnitt und Spanne je Kategorie. Proteinpulver liegt naturgemäß weit vorn; fairer vergleicht der Wert pro 100 kcal.</p>
      </header>
      <section className={ui.section} aria-label="Alle Kategorien">
        <div className={ui.tableCard}>
          <table className={ui.table}>
            <thead>
              <tr>
                <th scope="col">Kategorie</th>
                <th scope="col">Produkte</th>
                <th scope="col">Ø Protein</th>
                <th scope="col" className={ui.hideMobile}>Spanne</th>
                <th scope="col">Ø pro 100 kcal</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <th scope="row"><Link href={`/de/kategorien/${row.id}`}>{row.name}</Link></th>
                  <td>{row.count}</td>
                  <td>{format.format(row.average)} g <small>/ {row.unit}</small></td>
                  <td className={ui.hideMobile}>
                    <span className={ui.range} aria-label={`${format.format(row.min)} bis ${format.format(row.max)} g`}>
                      <i style={{ left: `${(row.min / maxRange) * 100}%`, width: `${Math.max(((row.max - row.min) / maxRange) * 100, 1.5)}%` }} />
                    </span>
                    <small>{format.format(row.min)}–{format.format(row.max)} g</small>
                  </td>
                  <td>{format.format(row.density)} g</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
