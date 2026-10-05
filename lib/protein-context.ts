import { brandById } from "@/lib/data/brands";
import {
  products,
  proteinEnergyShare,
  proteinPer100,
  proteinPer100Kcal,
  uniqueProductRepresentatives,
  type Product,
} from "@/lib/data/products";

// All thresholds were checked against the original texts on 2026-10-05.

// Regulation (EC) 1924/2006, Annex: "source of protein" when at least 12 % of the energy value comes from protein,
// "high protein" from 20 %.
export const euClaimsRegulationUrl = "https://eur-lex.europa.eu/eli/reg/2006/1924/oj";
export const proteinSourceMinShare = 0.12;
export const highProteinMinShare = 0.2;

// Regulation (EU) 1169/2011: Annex XIII Part B reference intake protein 50 g; Annex XIV 4 kcal per gram of protein.
export const euLabellingRegulationUrl = "https://eur-lex.europa.eu/eli/reg/2011/1169/oj";
export const proteinReferenceIntakeGrams = 50;

// DGE reference values (press release 08/2017): 0.8 g/kg body weight for adults 19 to under 65,
// estimated value 1.0 g/kg from 65.
export const dgeProteinUrl = "https://www.dge.de/fileadmin/dok/presse/meldungen/2011-2018/DGE-Pressemeldung-aktuell-08-2017-Referenzwert-Protein.pdf";

export function dgeProteinPerKg(age: number) {
  return age >= 65 ? 1.0 : 0.8;
}

export type ProteinClaim = "high" | "source" | "none";

export function proteinClaim(product: Product): ProteinClaim {
  const share = proteinEnergyShare(product);
  if (share === null) return "none";
  if (share >= highProteinMinShare) return "high";
  if (share >= proteinSourceMinShare) return "source";
  return "none";
}

export const proteinClaimLabel: Record<ProteinClaim, string> = {
  high: "hoher Proteingehalt",
  source: "Proteinquelle",
  none: "unter 12 % Energie aus Protein",
};

export function referenceIntakeShare(proteinGrams: number) {
  return Math.round((proteinGrams / proteinReferenceIntakeGrams) * 100);
}

// One representative per product (sizes collapse), same category and unit so 100 g and 100 ml never mix.
export function categoryPeers(product: Product) {
  return uniqueProductRepresentatives(products.filter((item) => item.categoryId === product.categoryId && item.unit === product.unit));
}

export function averageProteinPer100(items: Product[]) {
  return items.length ? items.reduce((sum, item) => sum + proteinPer100(item), 0) / items.length : null;
}

/** 1 = most protein per 100 g/ml among the peers. */
export function proteinRank(product: Product, peers: Product[]) {
  return peers.filter((item) => item.name !== product.name && proteinPer100(item) > proteinPer100(product)).length + 1;
}

/** 1 = most protein per 100 kcal among the peers. */
export function densityRank(product: Product, peers: Product[]) {
  const own = proteinPer100Kcal(product) ?? 0;
  return peers.filter((item) => item.name !== product.name && (proteinPer100Kcal(item) ?? 0) > own).length + 1;
}

const kcalTolerance = 1.1;
const minExtraProteinShare = 0.1;

const flavorStopWords = /\b(protein|whey|bar|riegel|shake|drink|high|pulver|powder|isolate|isolat|clear|vegan|designer|the|and|style|soft|layered|crunchy)\b/g;

function flavorWords(product: Product) {
  const brandWords = new Set((brandById[product.brandId]?.name ?? "").toLowerCase().split(/[^a-zäöüß]+/));
  return product.name.toLowerCase().replace(flavorStopWords, " ").split(/[^a-zäöüß]+/).filter((word) => word.length > 3 && !brandWords.has(word));
}

// Swaps with clearly more protein (at least 10 % more per 100 g/ml) and at most 10 % more kcal per 100 g/ml,
// same category and unit. Same brand first, then a shared flavor word, then the most protein per 100 kcal.
export function higherProteinAlternatives(product: Product, limit = 3) {
  const own = product.nutritionPer100;
  const flavors = new Set(flavorWords(product));
  const score = (item: Product) => (item.brandId === product.brandId ? 2 : 0) + (flavorWords(item).some((word) => flavors.has(word)) ? 1 : 0);
  return categoryPeers(product)
    .filter((item) => (
      item.name !== product.name
        && item.nutritionPer100.protein >= own.protein * (1 + minExtraProteinShare)
        && item.nutritionPer100.energyKcal <= own.energyKcal * kcalTolerance
    ))
    .sort((a, b) => score(b) - score(a) || (proteinPer100Kcal(b) ?? 0) - (proteinPer100Kcal(a) ?? 0) || a.name.localeCompare(b.name, "de"))
    .slice(0, limit);
}
