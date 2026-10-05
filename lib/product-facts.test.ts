import { describe, expect, it } from "vitest";
import { products, proteinPer100Kcal, type Product } from "@/lib/data/products";
import { isProductPage } from "@/lib/page-routing";
import { productFacts } from "@/lib/product-facts";

describe("product facts", () => {
  it("only repeat a sentence across products with identical data", () => {
    const byText = new Map<string, Product[]>();
    for (const product of products.filter(isProductPage)) {
      for (const fact of productFacts(product)) byText.set(fact.text, [...(byText.get(fact.text) ?? []), product]);
    }
    for (const [text, group] of byText) {
      // A shared sentence is fine when the numbers behind it are the same (flavors with identical values).
      const byProtein = new Set(group.map((item) => `${item.categoryId}:${item.nutritionPer100.protein}`));
      const byDensity = new Set(group.map((item) => `${item.categoryId}:${proteinPer100Kcal(item)}`));
      const byEnergyShare = new Set(group.map((item) => Math.round((item.nutritionPer100.protein * 400) / item.nutritionPer100.energyKcal)));
      expect(byProtein.size === 1 || byDensity.size === 1 || byEnergyShare.size === 1, text).toBe(true);
    }
  });
});
