import seed from "./drinks.seed.json";

export type Brand = {
  id: string;
  name: string;
  note: string;
};

const brandNotes: Record<string, string> = {
  barebells: "Proteinriegel und Snacks",
  esn: "Proteinriegel und Pulver",
  foodspring: "Proteinprodukte und Fitness-Food",
  ehrmann: "High-Protein-Kühlregal",
  mueller: "Protein-Puddings und Milchprodukte",
  milbona: "Handelsmarken-Proteinprodukte",
  "dm-sportness": "Drogerie-Proteinprodukte",
  powerbar: "Sportnahrung und Riegel",
  yfood: "Trinkfertige Proteinprodukte",
  more: "Pulver und Protein-Food",
  alpro: "Pflanzliche Proteinprodukte",
  arla: "Skyr und Milchproteinprodukte",
};

export const brands: Brand[] = seed.brands.map((brand) => ({
  ...brand,
  note: brandNotes[brand.id] ?? "Proteinprodukt-Marke",
}));

export const brandById = Object.fromEntries(brands.map((brand) => [brand.id, brand]));
