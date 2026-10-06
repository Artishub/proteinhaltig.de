import seed from "./products.seed.json";
import { productKey, type Product } from "./product-utils";

export * from "./product-utils";

export const products = seed.products as Product[];

/** All sizes of the same product (same brand and name). */
export function productFamily(product: Product) {
  const key = productKey(product);
  return products.filter((item) => productKey(item) === key);
}

