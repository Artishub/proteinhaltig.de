import { describe, expect, it } from "vitest";
import { brandById } from "@/lib/data/brands";
import { products } from "@/lib/data/products";
import { isProductPage } from "@/lib/page-routing";
import { heroAmount } from "@/lib/product-hero";
import { productMetaTitle } from "@/lib/product-meta";

const pages = products.filter(isProductPage);
const titleOf = (id: string) => {
  const product = pages.find((item) => item.id === id)!;
  return productMetaTitle(product, brandById[product.brandId]?.name ?? "");
};

describe("product meta title", () => {
  it("stays within 60 characters for every product page", () => {
    for (const product of pages) expect(productMetaTitle(product, brandById[product.brandId]?.name ?? "").length, product.id).toBeLessThanOrEqual(60);
  });

  it("names the fact card's number when it fits", () => {
    for (const product of pages) {
      const title = productMetaTitle(product, brandById[product.brandId]?.name ?? "");
      if (title.endsWith(": Protein & Nährwerte")) continue;
      const grams = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 }).format(heroAmount(product).grams);
      expect(title, product.id).toContain(`${grams} g`);
    }
  });

  it("uses per-package wording for a skyr cup", () => {
    expect(titleOf("arla-skyr-natur-450")).toBe("Arla Skyr Natur: 49,5 g Protein pro Becher");
  });
});
