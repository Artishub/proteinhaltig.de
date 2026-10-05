import { brandById } from "@/lib/data/brands";
import { categoryById } from "@/lib/data/categories";
import { packageProtein, proteinPer100, proteinPer100Kcal, servingProtein, sizeLabel, type Product } from "@/lib/data/products";
import { isProductPage, productPageHref } from "@/lib/page-routing";
import { products } from "@/lib/data/products";

// Compact, serialisable view of a product for client components (search, charts, cards).
export type ProductSummary = {
  id: string;
  name: string;
  brand: string;
  categoryId: string;
  category: string;
  href: string;
  unit: "g" | "ml";
  size: string;
  per100: number;
  kcal: number;
  density: number | null;
  total: number | null;
  serving: number | null;
};

export function productSummary(product: Product): ProductSummary {
  return {
    id: product.id,
    name: product.name,
    brand: brandById[product.brandId]?.name ?? "",
    categoryId: product.categoryId,
    category: categoryById[product.categoryId]?.name ?? "",
    href: productPageHref(product),
    unit: product.unit,
    size: sizeLabel(product),
    per100: proteinPer100(product),
    kcal: Math.round(product.nutritionPer100.energyKcal),
    density: proteinPer100Kcal(product),
    total: packageProtein(product),
    serving: servingProtein(product),
  };
}

/** One summary per product page (sizes collapse onto their page). */
export function pageSummaries() {
  return products.filter(isProductPage).map(productSummary);
}
