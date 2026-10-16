import { proteinPer100, type Product } from "@/lib/data/products";

// Search Console asks "wie viel Protein hat 500 g Skyr" a lot. The answer is the natural skyr range per 100 g
// in the database, scaled to 500 g; flavoured cups are reported separately because fruit lowers the value.
export function skyrStats(pages: Product[]) {
  const skyr = pages.filter((product) => /skyr/i.test(product.name) && !/drink/i.test(product.name));
  const natural = skyr.filter((product) => /natur/i.test(product.name));
  const values = (natural.length >= 3 ? natural : skyr).map(proteinPer100);
  const flavoured = skyr.filter((product) => !/natur/i.test(product.name)).map(proteinPer100);
  if (!values.length) return null;
  return {
    naturalCount: values.length,
    min: Math.min(...values),
    max: Math.max(...values),
    flavoured: flavoured.length >= 3 ? { min: Math.min(...flavoured), max: Math.max(...flavoured) } : null,
  };
}
