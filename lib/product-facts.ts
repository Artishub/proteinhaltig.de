import { brandById } from "@/lib/data/brands";
import { packageProtein, products, proteinPer100, proteinPer100Kcal, type Product } from "@/lib/data/products";
import { isProductPage, productPageSizes } from "@/lib/page-routing";
import { averageProteinPer100, categoryPeers, densityRank, proteinClaim, proteinRank } from "@/lib/protein-context";

// Sentences built only from this product's data. A fact appears only when its inputs are complete,
// so no page carries a filler sentence that reads the same everywhere.

export type ProductFact = { id: string; label: string; text: string };

const categoryPlural: Record<string, string> = {
  "protein-bar": "Proteinriegeln",
  "protein-yogurt": "Protein-Joghurts",
  "protein-pudding": "Protein-Puddings",
  "protein-drink": "Protein-Drinks",
  "protein-powder": "Proteinpulvern",
  "skyr-quark": "Skyr- und Quarkprodukten",
  "plant-protein": "pflanzlichen Proteinprodukten",
  "protein-snack": "Protein-Snacks",
};

const numberFormat = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 });
const format = (value: number) => numberFormat.format(value);

function ordinal(rank: number, total: number, what: string) {
  if (rank === 1) return `den höchsten ${what}`;
  if (rank === 2) return `den zweithöchsten ${what}`;
  if (rank === 3) return `den dritthöchsten ${what}`;
  if (rank === total) return `den niedrigsten ${what}`;
  return `Platz ${rank} von ${total} beim ${what}`;
}

export function productFacts(product: Product): ProductFact[] {
  const facts: ProductFact[] = [];
  const brandName = brandById[product.brandId]?.name ?? "";
  const plural = categoryPlural[product.categoryId];
  const peers = categoryPeers(product);
  const average = averageProteinPer100(peers);
  const unit = product.unit;

  if (plural && peers.length >= 5 && average !== null) {
    const rank = proteinRank(product, peers);
    const tied = peers.filter((item) => item.name !== product.name && proteinPer100(item) === proteinPer100(product)).length;
    const difference = proteinPer100(product) - average;
    const relation = Math.abs(difference) < 0.5
      ? `etwa im Durchschnitt von ${format(average)} g`
      : `${format(Math.abs(difference))} g ${difference > 0 ? "über" : "unter"} dem Durchschnitt von ${format(average)} g`;
    facts.push({
      id: "category-rank",
      label: "In der Kategorie",
      text: `Platz ${rank} von ${peers.length} ${plural}${tied ? ` (gleichauf mit ${tied} weiteren)` : ""}, sortiert nach Protein pro 100 ${unit}. Damit liegt es ${relation}.`,
    });

    const density = proteinPer100Kcal(product);
    const dRank = densityRank(product, peers);
    if (density !== null && Math.abs(dRank - rank) >= Math.max(3, peers.length * 0.15)) {
      facts.push({
        id: "density-rank",
        label: "Pro 100 kcal",
        text: `Nach Protein pro 100 kcal (${format(density)} g) steht es auf Platz ${dRank} von ${peers.length}. Gemessen an den Kalorien ${dRank < rank ? "schneidet es also besser" : "schneidet es also schlechter"} ab als pro 100 ${unit}.`,
      });
    }
  }

  const brandProducts = products.filter((item) => isProductPage(item) && item.brandId === product.brandId && item.categoryId === product.categoryId && item.unit === unit);
  if (brandName && brandProducts.length >= 3) {
    const sorted = [...brandProducts].sort((a, b) => proteinPer100(b) - proteinPer100(a));
    const own = proteinPer100(product);
    const rank = sorted.filter((item) => proteinPer100(item) > own).length + 1;
    const tied = sorted.filter((item) => item.name !== product.name && proteinPer100(item) === own).length;
    const top = proteinPer100(sorted[0]);
    const bottom = proteinPer100(sorted[sorted.length - 1]);
    if (top - bottom >= 1) {
      const position = ordinal(rank, brandProducts.length, "Proteinwert");
      facts.push({
        id: "brand-rank",
        label: `Bei ${brandName}`,
        text: `Unter ${brandProducts.length} Sorten von ${brandName} in dieser Kategorie hat es ${tied ? `gemeinsam mit ${tied} weiteren ${position}` : position} (Spanne ${format(bottom)} bis ${format(top)} g pro 100 ${unit}).`,
      });
    }
  }

  const sizes = productPageSizes(product).filter((item) => item.packageSize);
  if (sizes.length > 1) {
    const smallest = sizes[0];
    const largest = sizes[sizes.length - 1];
    const small = packageProtein(smallest);
    const large = packageProtein(largest);
    if (small !== null && large !== null) {
      facts.push({
        id: "sizes",
        label: "Packungsgrößen",
        text: `Erfasst in ${sizes.length} Größen von ${smallest.packageSize} bis ${largest.packageSize} ${unit}: ${format(small)} g bis ${format(large)} g Protein pro Packung.`,
      });
    }
  }

  // The EU claim only distinguishes when a product misses the 20 % mark; almost all products reach it.
  const claim = proteinClaim(product);
  if (claim !== "high") {
    const share = Math.round(((product.nutritionPer100.protein * 4) / product.nutritionPer100.energyKcal) * 100);
    facts.push({
      id: "claim",
      label: "EU-Kennzeichnung",
      text: claim === "source"
        ? `${share} % der Energie stammen aus Protein. Das reicht für die Angabe „Proteinquelle“ (ab 12 %), aber nicht für „hoher Proteingehalt“ (ab 20 %).`
        : `${share} % der Energie stammen aus Protein. Für die Angabe „Proteinquelle“ wären mindestens 12 % nötig.`,
    });
  }

  return facts;
}
