import type { Product } from "@/lib/data/product-utils";
import { heroAmount } from "@/lib/product-hero";

// Search snippets cut titles at about 60 characters. The title names the number people search for,
// the same one the fact card leads with; when it does not fit, the plain title stays.
const maxTitleLength = 60;
const format = (value: number) => new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 }).format(value);

export function shortTitle(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  const shortened = value.slice(0, maxLength - 3);
  const lastSpace = shortened.lastIndexOf(" ");
  return `${shortened.slice(0, lastSpace > 20 ? lastSpace : maxLength - 3)}...`;
}

export function plainProductTitle(productName: string, brandName: string) {
  const suffix = ": Protein & Nährwerte";
  const maxProductLength = maxTitleLength - brandName.length - suffix.length - 1;
  return `${brandName} ${shortTitle(productName, maxProductLength)}${suffix}`;
}

// Longest wording first: "pro Riegel", then "/Riegel", then without the word Protein when the name already has it.
export function productMetaTitle(product: Product, brandName: string) {
  const hero = heroAmount(product);
  const name = `${brandName} ${product.name}`.trim();
  const grams = `${format(hero.grams)} g`;
  const candidates = [
    `${name}: ${grams} Protein ${hero.short}`,
    `${name}: ${grams} Protein/${hero.short.replace(/^pro /, "")}`,
    /protein/i.test(product.name) ? `${name}: ${grams} ${hero.short}` : null,
  ];
  return candidates.find((title) => title !== null && title.length <= maxTitleLength) ?? plainProductTitle(product.name, brandName);
}
