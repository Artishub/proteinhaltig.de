import searchConsolePages from "@/lib/data/search-console-pages.json";
import { productFamily, products, type Product } from "@/lib/data/products";

// One page per product. Sizes of the same product (same brand and name) share the page of the size
// with the most Search Console impressions; the other sizes 301-redirect (Next answers 308) to it with an anchor.

const impressionsByPath = searchConsolePages.impressionsByPath as Record<string, number>;

export function productPath(productId: string) {
  return `/de/produkte/${productId}`;
}

export function searchImpressions(path: string) {
  return impressionsByPath[path] ?? 0;
}

export function sizeAnchor(product: Product) {
  if (product.packageSize) return `groesse-${product.packageSize}-${product.unit}`;
  return `portion-${product.servingSize ?? 0}-${product.unit}`;
}

// The size that carries the product page: most impressions, then a known package size, then the larger package.
// Resolved once per product; pages, facts and charts ask for it in tight loops.
const pageProductCache = new Map<string, Product>();

export function productPageProduct(product: Product) {
  const cached = pageProductCache.get(product.id);
  if (cached) return cached;
  const family = [...productFamily(product)].sort((a, b) => (
    searchImpressions(productPath(b.id)) - searchImpressions(productPath(a.id))
      || Number(Boolean(b.packageSize)) - Number(Boolean(a.packageSize))
      || (b.packageSize ?? 0) - (a.packageSize ?? 0)
      || a.id.localeCompare(b.id)
  ));
  const page = family[0] ?? product;
  for (const member of family) pageProductCache.set(member.id, page);
  return page;
}

/** Where a product URL redirects to, or null if the URL is the product page. */
export function productRedirectTarget(product: Product): string | null {
  const page = productPageProduct(product);
  return page.id === product.id ? null : `${productPath(page.id)}#${sizeAnchor(product)}`;
}

/** The href internal links should use, so they never point at a redirect. */
export function productPageHref(product: Product) {
  return productRedirectTarget(product) ?? productPath(product.id);
}

export function isProductPage(product: Product) {
  return productRedirectTarget(product) === null;
}

/** Sizes shown on a product page, smallest first; servings without package size last. */
export function productPageSizes(product: Product) {
  return [...productFamily(product)].sort((a, b) => (a.packageSize ?? Infinity) - (b.packageSize ?? Infinity) || a.id.localeCompare(b.id));
}

// Old product URLs that Google still knows (Search Console or earlier redirects). Targets are product ids
// and resolve through productPageHref, so every old URL needs exactly one redirect.
export const legacyProductRedirects: Record<string, string> = {
  "more-total-protein-sahne-1000": "more-saucen-back-protein-sahne-50",
  "yfood-high-protein-drink-chocolate-500": "yfood-ready-to-drink-classic-choco-500",
  "powerbar-protein-plus-52-chocolate-55": "powerbar-protein-plus-52-chocolate-nut-50",
  "esn-designer-bar-crunchy-fudge-45": "esn-designer-bar-fudge-brownie-45",
  "foodspring-protein-bar-extra-chocolate-60": "foodspring-protein-bar-extra-chocolate-crispy-coconut-45",
  "dm-sportness-protein-muesli-schoko-60": "dm-sportness-protein-waffel-60",
  "optimum-nutrition-clear-protein-dark-berry-280": "optimum-nutrition-clear-protein-dark-berry-240",
  "optimum-nutrition-clear-protein-mango-passionfruit-280": "optimum-nutrition-clear-protein-mango-passionfruit-240",
  "optimum-nutrition-clear-protein-peach-iced-tea-280": "optimum-nutrition-clear-protein-peach-240",
  "optimum-nutrition-protein-water-tropical-500": "optimum-nutrition-protein-water-tropical-350",
  "optimum-nutrition-protein-water-apple-raspberry-500": "optimum-nutrition-protein-water-apple-raspberry-350",
  "grenade-creme-egg-protein-bar-60": "grenade-creme-egg-protein-bar-45",
};

export function legacyRedirectTarget(oldId: string) {
  const targetId = legacyProductRedirects[oldId];
  const target = products.find((item) => item.id === targetId);
  return target ? productPageHref(target) : null;
}
