import fs from "node:fs";

const data = JSON.parse(fs.readFileSync(new URL("../lib/data/products.seed.json", import.meta.url), "utf8"));
const errors = [];
const warnings = [];

const brandIds = new Set(data.brands.map((brand) => brand.id));
const categoryIds = new Set(data.categories.map((category) => category.id));
const productIds = new Set();
const verifiedStatuses = new Set([
  "manufacturer_verified",
  "retailer_verified",
  "nutrition_database_verified",
  "manufacturer_or_retailer_verified",
]);
// The seed holds source data only. Derived values and FAQ are computed at build time.
const allowedKeys = new Set([
  "id", "name", "brandId", "categoryId", "packageSize", "unit", "servingSize",
  "nutritionPer100", "source", "sourceUrl", "note", "verificationStatus", "lastCheckedAt",
]);
const nutritionKeys = ["energyKj", "energyKcal", "carbohydrates", "sugar", "fat", "protein", "salt"];

for (const product of data.products) {
  const id = product.id;
  if (productIds.has(id)) errors.push(`${id}: duplicate product id`);
  productIds.add(id);

  for (const key of Object.keys(product)) {
    if (!allowedKeys.has(key)) errors.push(`${id}: field "${key}" is not allowed; store source data only (no faq, computed or derived values)`);
  }

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) errors.push(`${id}: id must be lowercase kebab-case`);
  if (!brandIds.has(product.brandId)) errors.push(`${id}: unknown brandId ${product.brandId}`);
  if (!categoryIds.has(product.categoryId)) errors.push(`${id}: unknown categoryId ${product.categoryId}`);
  if (!verifiedStatuses.has(product.verificationStatus)) errors.push(`${id}: unknown verificationStatus ${product.verificationStatus}`);
  if (!product.sourceUrl?.startsWith("https://")) errors.push(`${id}: sourceUrl must be an https URL`);
  if (!product.source) errors.push(`${id}: missing source`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(product.lastCheckedAt ?? "")) errors.push(`${id}: lastCheckedAt must be YYYY-MM-DD`);
  if (!["g", "ml"].includes(product.unit)) errors.push(`${id}: unit must be "g" or "ml"`);
  if (product.packageSize !== null && !(product.packageSize > 0)) errors.push(`${id}: packageSize must be a positive number or null`);
  if (product.servingSize !== undefined && !(product.servingSize > 0)) errors.push(`${id}: servingSize must be a positive number`);
  if (product.packageSize === null && product.servingSize === undefined) errors.push(`${id}: needs packageSize or servingSize`);

  const sourceText = `${product.source ?? ""} ${product.note ?? ""}`.toLowerCase();
  if (sourceText.includes("demo") || sourceText.includes("beispiel") || sourceText.includes("mvp")) {
    errors.push(`${id}: verified product still contains demo wording`);
  }

  const nutrition = product.nutritionPer100;
  if (!nutrition) {
    errors.push(`${id}: missing nutritionPer100`);
    continue;
  }
  for (const key of nutritionKeys) {
    if (key === "salt" && nutrition.salt === null) continue; // some sources (e.g. FDDB) give no salt value
    if (typeof nutrition[key] !== "number" || nutrition[key] < 0) errors.push(`${id}: nutritionPer100.${key} must be a number >= 0`);
  }
  if (nutrition.sugar > nutrition.carbohydrates + 0.05) errors.push(`${id}: sugar ${nutrition.sugar} > carbohydrates ${nutrition.carbohydrates}`);
  if (nutrition.protein + nutrition.carbohydrates + nutrition.fat > 100.5 && product.unit === "g") {
    errors.push(`${id}: protein + carbohydrates + fat exceed 100 g per 100 g`);
  }
  if (nutrition.energyKcal > 0 && (nutrition.protein * 4) / nutrition.energyKcal > 1.05) {
    errors.push(`${id}: protein energy share above 100 %`);
  }

  // Label kcal usually lands within 15 % of the macro sum; larger gaps are worth a source check.
  const macroKcal = nutrition.protein * 4 + nutrition.carbohydrates * 4 + nutrition.fat * 9;
  if (nutrition.energyKcal > 0 && Math.abs(macroKcal - nutrition.energyKcal) / nutrition.energyKcal > 0.15) {
    warnings.push(`${id}: label ${nutrition.energyKcal} kcal vs. ${Math.round(macroKcal)} kcal from macros`);
  }
}

if (warnings.length && process.env.VERBOSE) {
  console.warn(`Product data warnings (${warnings.length}):`);
  for (const warning of warnings) console.warn(`- ${warning}`);
}

if (errors.length) {
  console.error(`Product data validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Product data validation passed: ${data.products.length} products${warnings.length ? `, ${warnings.length} kcal warning(s) (VERBOSE=1 to list)` : ""}`);
