import { describe, expect, it } from "vitest";
import { products, proteinEnergyShare, type Product } from "@/lib/data/products";
import { dgeProteinPerKg, higherProteinAlternatives, proteinClaim, referenceIntakeShare } from "@/lib/protein-context";

function product(protein: number, energyKcal: number): Product {
  return {
    id: "test", name: "Test", brandId: "esn", categoryId: "protein-bar", packageSize: 50, unit: "g",
    nutritionPer100: { energyKj: energyKcal * 4.184, energyKcal, carbohydrates: 0, sugar: 0, fat: 0, protein, salt: 0 },
    source: "Test", sourceUrl: "https://example.com", note: "", verificationStatus: "manufacturer_verified", lastCheckedAt: "2026-10-05",
  };
}

describe("EU 1924/2006 protein claims", () => {
  it("uses 12 % and 20 % of energy from protein at 4 kcal per gram", () => {
    expect(proteinEnergyShare(product(10, 400))).toBeCloseTo(0.1);
    expect(proteinClaim(product(11.9, 400))).toBe("none");
    expect(proteinClaim(product(12, 400))).toBe("source");
    expect(proteinClaim(product(20, 400))).toBe("high");
  });
});

describe("reference values", () => {
  it("relates protein to the 50 g reference intake", () => {
    expect(referenceIntakeShare(20)).toBe(40);
  });

  it("uses the DGE values by age", () => {
    expect(dgeProteinPerKg(30)).toBe(0.8);
    expect(dgeProteinPerKg(65)).toBe(1.0);
  });
});

describe("higher-protein alternatives", () => {
  it("stay in the category with more protein and at most 10 % more kcal", () => {
    for (const base of products.slice(0, 60)) {
      for (const item of higherProteinAlternatives(base)) {
        expect(item.categoryId).toBe(base.categoryId);
        expect(item.nutritionPer100.protein).toBeGreaterThanOrEqual(base.nutritionPer100.protein * 1.1);
        expect(item.nutritionPer100.energyKcal).toBeLessThanOrEqual(base.nutritionPer100.energyKcal * 1.1);
      }
    }
  });
});
