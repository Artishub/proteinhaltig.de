#!/usr/bin/env node
// Token-friendly lookup for lib/data/products.seed.json.
// Usage:
//   npm run product -- <suchbegriff>       one line per match (id, name, brand, category, size, protein, kcal, status, date)
//   npm run product -- --full <product-id> one product as JSON
//   npm run product -- --brand <brand-id> | --category <category-id>
import { readFileSync } from "node:fs";

const seed = JSON.parse(readFileSync(new URL("../lib/data/products.seed.json", import.meta.url), "utf8"));
const [flag, ...rest] = process.argv.slice(2);
const term = (flag?.startsWith("--") ? rest.join(" ") : [flag, ...rest].join(" ")).trim().toLowerCase();

if (!flag) {
  console.log("Usage: npm run product -- <term> | --full <id> | --brand <id> | --category <id>");
  process.exit(1);
}

if (flag === "--full") {
  const product = seed.products.find((item) => item.id === term);
  if (!product) {
    console.error(`No product with id "${term}"`);
    process.exit(1);
  }
  console.log(JSON.stringify(product, null, 2));
  process.exit(0);
}

const matches = seed.products.filter((product) => {
  if (flag === "--brand") return product.brandId === term;
  if (flag === "--category") return product.categoryId === term;
  return [product.id, product.name, product.brandId].some((value) => value.toLowerCase().includes(term));
});

for (const product of matches) {
  console.log([
    product.id,
    product.name,
    product.brandId,
    product.categoryId,
    product.packageSize ? `${product.packageSize} ${product.unit}` : `Portion ${product.servingSize} ${product.unit}`,
    `${product.nutritionPer100.protein} g/100${product.unit}`,
    `${product.nutritionPer100.energyKcal} kcal`,
    product.verificationStatus,
    product.lastCheckedAt,
  ].join(" | "));
}
console.log(`${matches.length} match(es)`);
