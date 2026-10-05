import seed from "./products.seed.json";

export type VerificationStatus =
  | "manufacturer_verified"
  | "retailer_verified"
  | "nutrition_database_verified"
  | "manufacturer_or_retailer_verified";

export type Nutrition = {
  energyKj: number;
  energyKcal: number;
  carbohydrates: number;
  sugar: number;
  fat: number;
  protein: number;
  /** null when the source gives no salt value. */
  salt: number | null;
};

// Source data only. Everything derived (package protein, kcal, energy share) is computed below.
export type Product = {
  id: string;
  name: string;
  brandId: string;
  categoryId: string;
  /** Package content in `unit`; null when only a serving is known. */
  packageSize: number | null;
  unit: "g" | "ml";
  /** Manufacturer serving in `unit`, only when the source states it. */
  servingSize?: number;
  nutritionPer100: Nutrition;
  source: string;
  sourceUrl: string;
  note: string;
  verificationStatus: VerificationStatus;
  lastCheckedAt: string;
};

export const products = seed.products as Product[];

export type ProductDisplayItem =
  | { type: "product"; id: string; product: Product }
  | { type: "group"; id: string; brandId: string; categoryId: string; products: Product[]; representative: Product };

const round1 = (value: number) => Math.round(value * 10) / 10;

export function proteinPer100(product: Product) {
  return product.nutritionPer100.protein;
}

export function packageProtein(product: Product) {
  return product.packageSize ? round1(product.nutritionPer100.protein * (product.packageSize / 100)) : null;
}

export function servingProtein(product: Product) {
  return product.servingSize ? round1(product.nutritionPer100.protein * (product.servingSize / 100)) : null;
}

export function packageEnergyKcal(product: Product) {
  return product.packageSize ? Math.round(product.nutritionPer100.energyKcal * (product.packageSize / 100)) : null;
}

/** Grams of protein per 100 kcal (protein density). */
export function proteinPer100Kcal(product: Product) {
  const { protein, energyKcal } = product.nutritionPer100;
  return energyKcal > 0 ? round1((protein / energyKcal) * 100) : null;
}

/** Share of energy from protein, using 4 kcal per gram (EU Regulation 1169/2011, Annex XIV). */
export function proteinEnergyShare(product: Product) {
  const { protein, energyKcal } = product.nutritionPer100;
  return energyKcal > 0 ? (protein * 4) / energyKcal : null;
}

export function per100Label(product: Product) {
  return `100 ${product.unit}`;
}

export function sizeLabel(product: Product) {
  if (product.packageSize) return `${product.packageSize} ${product.unit}`;
  if (product.servingSize) return `${product.servingSize}-${product.unit}-Portion`;
  return "Größe offen";
}

export function verificationLabel(product: Product) {
  if (product.verificationStatus === "manufacturer_verified") return "Herstellerquelle geprüft";
  if (product.verificationStatus === "retailer_verified") return "Händlerquelle geprüft";
  if (product.verificationStatus === "nutrition_database_verified") return "Nährwertdatenbank geprüft";
  if (product.verificationStatus === "manufacturer_or_retailer_verified") return "Hersteller- oder Händlerquelle geprüft";
  return "Quelle noch nicht geprüft";
}

export function productKey(product: Product) {
  return `${product.brandId}:${product.name.trim().toLowerCase()}`;
}

/** All sizes of the same product (same brand and name). */
export function productFamily(product: Product) {
  const key = productKey(product);
  return products.filter((item) => productKey(item) === key);
}

export function uniqueProductRepresentatives(items: Product[]) {
  const byProduct = new Map<string, Product>();

  for (const product of items) {
    const current = byProduct.get(productKey(product));
    if (!current || representativeScore(product) < representativeScore(current)) {
      byProduct.set(productKey(product), product);
    }
  }

  return Array.from(byProduct.values());
}

export function groupedProductFamilies(items: Product[]): ProductDisplayItem[] {
  const grouped = new Map<string, Product[]>();

  for (const product of uniqueProductRepresentatives(items)) {
    const key = `${product.brandId}:${product.categoryId}`;
    grouped.set(key, [...(grouped.get(key) ?? []), product]);
  }

  return Array.from(grouped.entries()).flatMap<ProductDisplayItem>(([id, groupProducts]) => {
    if (groupProducts.length === 1) {
      const product = groupProducts[0];
      return [{ type: "product", id: product.id, product }];
    }

    return [
      {
        type: "group",
        id: `group:${id}`,
        brandId: groupProducts[0].brandId,
        categoryId: groupProducts[0].categoryId,
        products: groupProducts,
        representative: groupProducts[0],
      },
    ];
  });
}

function representativeScore(product: Product) {
  if (!product.packageSize) return 999;
  return Math.abs(product.packageSize - 200);
}
