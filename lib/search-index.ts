import { brandById } from "@/lib/data/brands";
import { categoryById } from "@/lib/data/categories";
import { products, proteinPer100, sizeLabel } from "@/lib/data/products";
import { isProductPage, productPageHref } from "@/lib/page-routing";

// Compact search index, served as a static JSON file and loaded by the search boxes on first use,
// so no page ships the full product database in its JavaScript.
// Entry: [href, brand, name, category, size, protein per 100, unit]
export type SearchEntry = [string, string, string, string, string, number, string];

export function searchIndex(): SearchEntry[] {
  return products.filter(isProductPage).map((product) => [
    productPageHref(product),
    brandById[product.brandId]?.name ?? "",
    product.name,
    categoryById[product.categoryId]?.name ?? "",
    sizeLabel(product),
    proteinPer100(product),
    product.unit,
  ]);
}
