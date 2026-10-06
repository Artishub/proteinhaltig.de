import { packageProtein, proteinPer100, servingProtein, type Product } from "@/lib/data/product-utils";

export type HeroAmount = { basis: "serving" | "package" | "per100"; grams: number; size: number; label: string };

// The number people search for: per serving when the source states one, per package for single-serve
// products (bars, drinks, cups, tubs), otherwise per 100 g (powders, multi-serve packs).
const singleServeCategories = new Set(["protein-pudding", "protein-yogurt", "skyr-quark"]);

export function heroAmount(product: Product): HeroAmount {
  const serving = servingProtein(product);
  if (serving !== null && product.servingSize) {
    return { basis: "serving", grams: serving, size: product.servingSize, label: `pro ${product.servingSize}-${product.unit}-Portion` };
  }
  const total = packageProtein(product);
  if (total !== null && product.packageSize && (product.unit === "ml" || singleServeCategories.has(product.categoryId) || product.packageSize <= 120)) {
    return { basis: "package", grams: total, size: product.packageSize, label: `pro ${packageNoun(product)} (${product.packageSize} ${product.unit})` };
  }
  return { basis: "per100", grams: proteinPer100(product), size: 100, label: `pro 100 ${product.unit}` };
}

function packageNoun(product: Product) {
  if (product.categoryId === "protein-bar") return "Riegel";
  if (product.unit === "ml") return "Flasche";
  if (product.categoryId === "skyr-quark" || product.categoryId === "protein-pudding" || product.categoryId === "protein-yogurt") return "Becher";
  return "Packung";
}
