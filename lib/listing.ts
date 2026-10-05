import type { ProductTableRow } from "@/components/ui/product-table";
import { brandById } from "@/lib/data/brands";
import { categoryById } from "@/lib/data/categories";
import { products, proteinPer100, proteinPer100Kcal, sizeLabel, type Product } from "@/lib/data/products";
import { isProductPage, productPageHref } from "@/lib/page-routing";
import { heroAmount } from "@/lib/product-hero";

const pages = products.filter(isProductPage);

export function brandProducts(brandId: string) {
  return pages.filter((product) => product.brandId === brandId);
}

export function categoryProducts(categoryId: string) {
  return pages.filter((product) => product.categoryId === categoryId);
}

export function tableRow(product: Product, secondary: "brand" | "category"): ProductTableRow {
  const hero = heroAmount(product);
  return {
    id: product.id,
    href: productPageHref(product),
    name: secondary === "category" ? `${brandById[product.brandId]?.name ?? ""} ${product.name}`.trim() : product.name,
    secondary: secondary === "brand" ? `${categoryById[product.categoryId]?.name ?? ""} · ${sizeLabel(product)}` : sizeLabel(product),
    unit: product.unit,
    per100: proteinPer100(product),
    portion: hero.basis === "per100" ? null : hero.grams,
    portionLabel: hero.basis === "per100" ? null : hero.label.replace(/^pro /, ""),
    kcal: Math.round(product.nutritionPer100.energyKcal),
    density: proteinPer100Kcal(product),
    sugar: product.nutritionPer100.sugar,
    fat: product.nutritionPer100.fat,
  };
}

export type GroupStats = {
  count: number;
  average: number;
  min: Product;
  max: Product;
  densityAverage: number;
  densityMax: Product;
  units: Set<string>;
};

export function groupStats(items: Product[]): GroupStats | null {
  if (!items.length) return null;
  const byProtein = [...items].sort((a, b) => proteinPer100(b) - proteinPer100(a));
  const byDensity = [...items].sort((a, b) => (proteinPer100Kcal(b) ?? 0) - (proteinPer100Kcal(a) ?? 0));
  const densities = items.map(proteinPer100Kcal).filter((value): value is number => value !== null);
  return {
    count: items.length,
    average: items.reduce((sum, item) => sum + proteinPer100(item), 0) / items.length,
    max: byProtein[0],
    min: byProtein[byProtein.length - 1],
    densityAverage: densities.reduce((sum, value) => sum + value, 0) / Math.max(densities.length, 1),
    densityMax: byDensity[0],
    units: new Set(items.map((item) => item.unit)),
  };
}
