import type { Metadata } from "next";
import Link from "next/link";
import { ProteinCalculator, type CalculatorProduct } from "@/components/protein-calculator";
import ui from "@/components/ui/ui.module.css";
import { brandById } from "@/lib/data/brands";
import { products, proteinPer100 } from "@/lib/data/products";
import { productsByDemand } from "@/lib/home-data";
import { isProductPage, productPageHref } from "@/lib/page-routing";
import { heroAmount } from "@/lib/product-hero";
import { dgeProteinUrl } from "@/lib/protein-context";
import { pageMetadata } from "@/lib/seo";
import { isSearchIndexablePage } from "@/lib/seo-index";

const path = "/de/proteinbedarf-rechner";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Proteinbedarf berechnen",
    description: "Proteinbedarf nach Körpergewicht und Alter berechnen (DGE: 0,8 g pro kg, ab 65 Jahren 1,0 g) und mit Proteinprodukten aus der Datenbank zusammenrechnen.",
    path,
  }),
  robots: isSearchIndexablePage(path) ? { index: true, follow: true } : { index: false, follow: true },
};

const numberFormat = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 });

export default function ProteinCalculatorPage() {
  const calculatorProducts: CalculatorProduct[] = products.filter(isProductPage).map((product) => {
    const hero = heroAmount(product);
    return {
      id: product.id,
      label: `${brandById[product.brandId]?.name ?? ""} ${product.name}`.trim(),
      href: productPageHref(product),
      unit: product.unit,
      per100: proteinPer100(product),
      kcalPer100: product.nutritionPer100.energyKcal,
      defaultAmount: hero.basis === "per100" ? 30 : hero.size,
    };
  });
  const combos = thirtyGramCombos();

  return (
    <main className={ui.page}>
      <header className={ui.pageHead}>
        <h1>Proteinbedarf berechnen</h1>
        <p className={ui.lead}>Körpergewicht mal Referenzwert der DGE ergibt die empfohlene Proteinmenge pro Tag. Darunter kannst du Produkte aus der Datenbank zusammenrechnen.</p>
      </header>

      <ProteinCalculator products={calculatorProducts} dgeUrl={dgeProteinUrl} />

      {combos.length > 0 && (
        <section className={ui.section} aria-labelledby="dreissig">
          <div className={ui.sectionHead}>
            <div>
              <h2 id="dreissig">So kommst du auf 30 g Protein</h2>
              <p className={ui.sectionLead}>Zwei Portionen aus der Datenbank, die zusammen 30 bis 40 g ergeben, sortiert nach Kalorien. Reine Rechnung mit den Herstellerwerten.</p>
            </div>
          </div>
          <div className={ui.tableCard}>
            <table className={ui.table}>
              <thead><tr><th scope="col">Kombination</th><th scope="col">Protein</th><th scope="col">kcal</th></tr></thead>
              <tbody>
                {combos.map((combo) => (
                  <tr key={combo.parts.map((part) => part.id).join("+")}>
                    <th scope="row">
                      {combo.parts.map((part, index) => (
                        <span key={part.id}>{index > 0 && " + "}<Link href={part.href}>{part.label}</Link> <small>({part.size})</small></span>
                      ))}
                    </th>
                    <td>{numberFormat.format(combo.protein)} g</td>
                    <td>{Math.round(combo.kcal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}

// Pairs of single-serve products (bar, cup, bottle, stated serving) that together reach 30 to 40 g,
// fewest kcal first, every product at most once and no two from the same category.
function thirtyGramCombos() {
  const pool = productsByDemand(80)
    .map((product) => ({ product, hero: heroAmount(product) }))
    .filter(({ hero }) => hero.basis !== "per100" && hero.grams >= 8 && hero.grams < 30)
    .map(({ product, hero }) => ({
      id: product.id,
      label: `${brandById[product.brandId]?.name ?? ""} ${product.name}`.trim(),
      href: productPageHref(product),
      categoryId: product.categoryId,
      size: hero.label.replace(/^pro /, ""),
      protein: hero.grams,
      kcal: (product.nutritionPer100.energyKcal * hero.size) / 100,
    }));
  const pairs = [];
  for (let i = 0; i < pool.length; i += 1) {
    for (let j = i + 1; j < pool.length; j += 1) {
      const protein = pool[i].protein + pool[j].protein;
      if (pool[i].categoryId === pool[j].categoryId || protein < 30 || protein > 40) continue;
      pairs.push({ parts: [pool[i], pool[j]], protein, kcal: pool[i].kcal + pool[j].kcal });
    }
  }
  const used = new Set<string>();
  return pairs
    .sort((a, b) => a.kcal - b.kcal)
    .filter((pair) => {
      if (pair.parts.some((part) => used.has(part.id))) return false;
      pair.parts.forEach((part) => used.add(part.id));
      return true;
    })
    .slice(0, 6);
}
