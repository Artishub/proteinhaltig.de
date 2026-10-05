import { brands } from "@/lib/data/brands";
import { categories } from "@/lib/data/categories";
import { products, proteinPer100, proteinPer100Kcal, type Product } from "@/lib/data/products";
import { isProductPage, productPath, searchImpressions } from "@/lib/page-routing";

const pages = products.filter(isProductPage);

/** Product pages ordered by Search Console impressions (export in lib/data/search-console-pages.json). */
export function productsByDemand(limit: number) {
  return [...pages]
    .sort((a, b) => searchImpressions(productPath(b.id)) - searchImpressions(productPath(a.id)) || a.id.localeCompare(b.id))
    .slice(0, limit);
}

/** Daily rotation over the 20 most-searched products, stable for a whole day. */
export function showcaseProduct(date = new Date()) {
  const pool = productsByDemand(20);
  const day = Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86_400_000);
  return pool[day % pool.length];
}

export type CategoryRow = {
  id: string;
  name: string;
  count: number;
  unit: string;
  average: number;
  min: number;
  max: number;
  density: number;
};

export function categoryRows(): CategoryRow[] {
  return categories
    .map((category) => {
      const items = pages.filter((product) => product.categoryId === category.id);
      if (!items.length) return null;
      const values = items.map(proteinPer100);
      const densities = items.map(proteinPer100Kcal).filter((value): value is number => value !== null);
      const units = new Set(items.map((item) => item.unit));
      return {
        id: category.id,
        name: category.name,
        count: items.length,
        unit: units.size === 1 ? `100 ${[...units][0]}` : "100 g/ml",
        average: values.reduce((sum, value) => sum + value, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        density: densities.reduce((sum, value) => sum + value, 0) / densities.length,
      };
    })
    .filter((row): row is CategoryRow => row !== null)
    .sort((a, b) => b.count - a.count);
}

export function siteStats() {
  const latest = pages.map((product) => product.lastCheckedAt).sort().at(-1) ?? "";
  const usedBrands = new Set(pages.map((product) => product.brandId));
  return { productCount: pages.length, brandCount: brands.filter((brand) => usedBrands.has(brand.id)).length, latestCheck: latest };
}

export function formulaExample(): Product {
  return pages.find((product) => product.id === "barebells-protein-bar-caramel-cashew-55") ?? pages[0];
}
