import seed from "./drinks.seed.json";

export type DrinkCategory = {
  id: string;
  name: string;
  description: string;
  color: string;
};

const categoryMeta: Record<string, Pick<DrinkCategory, "description" | "color">> = {
  "protein-bar": {
    description: "Riegel mit hohem Proteinanteil für unterwegs.",
    color: "#1a1a1a",
  },
  "protein-yogurt": {
    description: "Joghurtprodukte mit zusätzlichem Protein.",
    color: "#5c5045",
  },
  "protein-pudding": {
    description: "Protein-Puddings aus dem Kühlregal.",
    color: "#ffb84d",
  },
  "protein-drink": {
    description: "Trinkfertige Proteinshakes und Drinks.",
    color: "#989898",
  },
  "protein-powder": {
    description: "Whey, Mehrkomponenten- und Portionspulver.",
    color: "#6f6f6f",
  },
  "skyr-quark": {
    description: "Skyr, Quark und natürliche Milchproteinprodukte.",
    color: "#d89a2b",
  },
  "plant-protein": {
    description: "Pflanzliche Proteinprodukte auf Soja-, Erbsen- oder Haferbasis.",
    color: "#b18a44",
  },
  "protein-snack": {
    description: "Müslis, Snacks und kleine proteinreiche Produkte.",
    color: "#8f8f8f",
  },
};

export const categories: DrinkCategory[] = seed.categories.map((category) => ({
  ...category,
  description: categoryMeta[category.id]?.description ?? "Proteinprodukt-Kategorie.",
  color: categoryMeta[category.id]?.color ?? "#838383",
}));

export const categoryById = Object.fromEntries(categories.map((category) => [category.id, category]));
