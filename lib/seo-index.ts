import indexedProducts from "@/lib/data/indexed-products.json";
import type { Product } from "@/lib/data/products";
import { isProductPage } from "@/lib/page-routing";

// Indexing is allowlist-based. The list holds every product page that was live and indexable on 2026-10-05
// (Search Console showed impressions for almost all of them). New products stay `noindex, follow`
// until they are added here in a wave of at most 15–20 IDs (skill `seo-wave`).
// The same check drives robots, the sitemap and internal "indexable" assertions in seo:check.

const indexedProductIds = new Set<string>(indexedProducts.ids);

export function isSearchIndexableProduct(product: Product) {
  return isProductPage(product) && indexedProductIds.has(product.id);
}

export const indexingWaves = indexedProducts.waves;

// Brand and category landing pages. Empty until the user approves a wave; until then they render `noindex, follow`.
export const searchIndexableBrandIds: string[] = [];
export const searchIndexableCategoryIds: string[] = [];

export function isSearchIndexableBrand(brandId: string) {
  return searchIndexableBrandIds.includes(brandId);
}

export function isSearchIndexableCategory(categoryId: string) {
  return searchIndexableCategoryIds.includes(categoryId);
}

// Standalone tools and new static pages. Empty until the user approves them for the index.
export const searchIndexablePaths: string[] = [];

export function isSearchIndexablePage(path: string) {
  return searchIndexablePaths.includes(path);
}
