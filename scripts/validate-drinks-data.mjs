import fs from "node:fs";

const data = JSON.parse(fs.readFileSync(new URL("../lib/data/drinks.seed.json", import.meta.url), "utf8"));
const errors = [];

const brandIds = new Set(data.brands.map((brand) => brand.id));
const categoryIds = new Set(data.categories.map((category) => category.id));
const productIds = new Set();
const verifiedStatuses = new Set([
  "manufacturer_verified",
  "retailer_verified",
  "nutrition_database_verified",
  "manufacturer_or_retailer_verified",
]);
const allowedStatuses = verifiedStatuses;

for (const drink of data.drinks) {
  if (productIds.has(drink.id)) errors.push(`${drink.id}: duplicate drink id`);
  productIds.add(drink.id);

  if (!brandIds.has(drink.brandId)) errors.push(`${drink.id}: unknown brandId ${drink.brandId}`);
  if (!categoryIds.has(drink.categoryId)) errors.push(`${drink.id}: unknown categoryId ${drink.categoryId}`);
  if (!allowedStatuses.has(drink.verificationStatus)) errors.push(`${drink.id}: unknown verificationStatus ${drink.verificationStatus}`);
  if (!drink.sourceUrl) errors.push(`${drink.id}: missing sourceUrl`);

  const hasSize = typeof drink.sizeMl === "number";
  const calculatedEnergy = drink.nutritionPer100Ml && hasSize ? round1(drink.nutritionPer100Ml.energyKcal * (drink.sizeMl / 100)) : null;
  const sourceText = `${drink.source ?? ""} ${drink.note ?? ""}`.toLowerCase();
  const hasDemoText = sourceText.includes("demo") || sourceText.includes("beispiel") || sourceText.includes("mvp");

  if (verifiedStatuses.has(drink.verificationStatus)) {
    if (!drink.nutritionPer100Ml) errors.push(`${drink.id}: verified product missing nutritionPer100Ml`);
    if (!drink.lastCheckedAt) errors.push(`${drink.id}: verified product missing lastCheckedAt`);
    if (hasDemoText) errors.push(`${drink.id}: verified product still contains demo wording`);
  }

  if (drink.sugarPer100Ml !== null && typeof drink.sugarPer100Ml !== "number") {
    errors.push(`${drink.id}: proteinPer100 must be number or null`);
  }

  if (drink.nutritionPer100Ml && drink.sugarPer100Ml !== null && !close(drink.nutritionPer100Ml.protein, drink.sugarPer100Ml)) {
    errors.push(`${drink.id}: nutritionPer100Ml.protein ${drink.nutritionPer100Ml.protein} != proteinPer100 ${drink.sugarPer100Ml}`);
  }

  if (drink.computed) {
    if (calculatedEnergy !== null && !close(drink.computed.energyKcalPerPackage, calculatedEnergy)) {
      errors.push(`${drink.id}: computed.energyKcalPerPackage ${drink.computed.energyKcalPerPackage} != calculated ${calculatedEnergy}`);
    }
  }
}

if (errors.length) {
  console.error(`Product data validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Product data validation passed: ${data.drinks.length} products`);

function round1(value) {
  return Math.round(value * 10) / 10;
}

function close(a, b) {
  return Math.abs(a - b) <= 0.05;
}
