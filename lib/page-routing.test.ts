import { describe, expect, it } from "vitest";
import searchConsolePages from "@/lib/data/search-console-pages.json";
import { products } from "@/lib/data/products";
import { legacyProductRedirects, productPageHref, productRedirectTarget } from "@/lib/page-routing";
import { allProductRedirects, productRedirectFor } from "@/lib/product-redirects";

const byId = (id: string) => products.find((item) => item.id === id)!;

describe("one page per product", () => {
  it("sends smaller-demand sizes to the size with the most impressions", () => {
    expect(productRedirectTarget(byId("esn-isoclear-whey-protein-isolate-green-apple-300"))).toBe("/de/produkte/esn-isoclear-whey-protein-isolate-green-apple-908#groesse-300-g");
    expect(productRedirectTarget(byId("esn-isoclear-whey-protein-isolate-green-apple-908"))).toBeNull();
    expect(productRedirectTarget(byId("weider-protein-80-plus-schoko-2000"))).toBe("/de/produkte/weider-protein-80-plus-schoko-500#groesse-2000-g");
  });

  it("keeps products without size variants on their own page", () => {
    expect(productRedirectTarget(byId("barebells-protein-bar-caramel-cashew-55"))).toBeNull();
  });

  it("resolves old URLs in one hop to a page that renders", () => {
    expect(productRedirectFor("/de/produkte/esn-designer-bar-crunchy-fudge-45")).toBe("/de/produkte/esn-designer-bar-fudge-brownie#groesse-45-g");
    for (const [path, target] of allProductRedirects()) {
      const targetId = target.split("#")[0].split("/").pop()!;
      const page = products.find((item) => item.id === targetId);
      expect(page, `${path} -> ${target}`).toBeDefined();
      expect(productRedirectTarget(page!), `${path} -> ${target} must not chain`).toBeNull();
    }
    for (const oldId of Object.keys(legacyProductRedirects)) expect(productRedirectFor(`/de/produkte/${oldId}`)).not.toBeNull();
  });

  it("never drops a product URL that had impressions", () => {
    const ids = new Set(products.map((item) => item.id));
    for (const path of Object.keys(searchConsolePages.impressionsByPath)) {
      const match = /^\/de\/produkte\/([^/]+)$/.exec(path);
      if (!match || match[1] === "vergleich") continue;
      const resolvable = (ids.has(match[1]) && (productRedirectTarget(byId(match[1])) === null || productRedirectFor(path))) || productRedirectFor(path) || match[1] === "ehrmann-high-protein-joghurt-vanille-200";
      expect(resolvable, path).toBeTruthy();
    }
  });

  it("builds internal links that never point at a redirect", () => {
    for (const product of products) {
      const href = productPageHref(product).split("#")[0];
      expect(productRedirectFor(href)).toBeNull();
    }
  });
});
