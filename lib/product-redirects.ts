import { products } from "@/lib/data/products";
import { legacyProductRedirects, legacyRedirectTarget, productRedirectTarget } from "@/lib/page-routing";

// Every /de/produkte/<id> that redirects, resolved once. The middleware answers these directly,
// so a redirect never goes through a page render.
const targets = new Map<string, string>();

for (const oldId of Object.keys(legacyProductRedirects)) {
  const target = legacyRedirectTarget(oldId);
  if (target) targets.set(oldId, target);
}

for (const product of products) {
  const target = productRedirectTarget(product);
  if (target) targets.set(product.id, target);
}

export function productRedirectFor(pathname: string) {
  const match = /^\/de\/produkte\/([^/]+)\/?$/.exec(pathname);
  return match ? targets.get(match[1]) ?? null : null;
}

export function allProductRedirects() {
  return new Map(targets);
}
