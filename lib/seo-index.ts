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
