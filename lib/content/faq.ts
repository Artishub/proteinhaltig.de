import { brandById } from "@/lib/data/brands";
import { products, proteinPer100, proteinPer100Kcal, type Product } from "@/lib/data/products";
import { isProductPage } from "@/lib/page-routing";
import { heroAmount } from "@/lib/product-hero";
import { dgeProteinUrl, highProteinMinShare, proteinReferenceIntakeGrams, proteinSourceMinShare } from "@/lib/protein-context";

// Questions follow Search Console queries (skyr, joghurt, pudding, riegel, bedarf). Every number in an answer
// is computed from the product data at build time, so answers stay in step with the database.

export type FaqItem = { question: string; answer: string; href?: string; linkLabel?: string };
export type FaqCategory = { id: string; title: string; items: FaqItem[] };

const pages = products.filter(isProductPage);
const format = (value: number) => new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 }).format(value);
const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};
const fullName = (product: Product) => `${brandById[product.brandId]?.name ?? ""} ${product.name}`.trim();

function skyrAnswer() {
  const skyr = pages.filter((product) => /skyr/i.test(product.name) && !/drink/i.test(product.name));
  const natural = skyr.filter((product) => /natur/i.test(product.name));
  const values = (natural.length >= 3 ? natural : skyr).map(proteinPer100);
  const flavoured = skyr.filter((product) => !/natur/i.test(product.name)).map(proteinPer100);
  const flavourPart = flavoured.length >= 3 ? ` Sorten mit Frucht oder Vanille liegen bei ${format(Math.min(...flavoured))} bis ${format(Math.max(...flavoured))} g.` : "";
  return `Naturskyr hat ${format(Math.min(...values))} bis ${format(Math.max(...values))} g Protein pro 100 g (${values.length} Produkte in der Datenbank). Ein 500-g-Becher mit 11 g pro 100 g liefert damit 55 g Protein.${flavourPart}`;
}

function yogurtAnswer() {
  const candidates = pages.filter((product) => ["protein-yogurt", "skyr-quark"].includes(product.categoryId));
  const top = [...candidates].sort((a, b) => proteinPer100(b) - proteinPer100(a)).slice(0, 3);
  return `Am meisten Protein pro 100 g haben Magerquark und Quarkcremes: ${top.map((product) => `${fullName(product)} (${format(proteinPer100(product))} g)`).join(", ")}.`;
}

function barAnswer() {
  const bars = pages.filter((product) => product.categoryId === "protein-bar" && heroAmount(product).basis === "package");
  const perBar = bars.map((product) => heroAmount(product).grams);
  return `Ein Proteinriegel hat im Mittel ${format(median(perBar))} g Protein (Median aus ${bars.length} Riegeln), die Spanne reicht von ${format(Math.min(...perBar))} bis ${format(Math.max(...perBar))} g. Entscheidend ist das Riegelgewicht: 36 g pro 100 g ergeben bei 55 g rund 20 g, bei 40 g nur 14 g.`;
}

function puddingAnswer() {
  const puddings = pages.filter((product) => product.categoryId === "protein-pudding" && heroAmount(product).basis === "package");
  const perCup = puddings.map((product) => heroAmount(product).grams);
  const ten = puddings.filter((product) => proteinPer100(product) === 10).length;
  return `${ten} von ${puddings.length} Protein-Puddings und -Desserts haben genau 10 g Protein pro 100 g. Pro Becher sind es ${format(Math.min(...perCup))} bis ${format(Math.max(...perCup))} g, beim üblichen 200-g-Becher 20 g.`;
}

function densityAnswer() {
  const average = (categoryId: string) => {
    const values = pages.filter((product) => product.categoryId === categoryId).map(proteinPer100Kcal).filter((value): value is number => value !== null);
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  };
  return `Der Wert zeigt, wie viel Protein ein Produkt im Verhältnis zu seinen Kalorien liefert. Pro 100 g liegt Proteinpulver immer vorn. Pro 100 kcal liefern Skyr und Quark im Schnitt ${format(average("skyr-quark"))} g, Proteinriegel ${format(average("protein-bar"))} g und Proteinpulver ${format(average("protein-powder"))} g.`;
}

export const faqCategories: FaqCategory[] = [
  {
    id: "produkte",
    title: "Wie viel Protein steckt drin?",
    items: [
      { question: "Wie viel Protein hat Skyr?", answer: skyrAnswer(), href: "/de/kategorien/skyr-quark", linkLabel: "Skyr und Quark vergleichen" },
      { question: "Welcher Joghurt hat am meisten Protein?", answer: yogurtAnswer(), href: "/de/kategorien/skyr-quark", linkLabel: "Alle Quark- und Skyrprodukte" },
      { question: "Wie viel Protein hat ein Proteinriegel?", answer: barAnswer(), href: "/de/kategorien/protein-bar", linkLabel: "Proteinriegel vergleichen" },
      { question: "Wie viel Protein hat ein Protein-Pudding?", answer: puddingAnswer(), href: "/de/kategorien/protein-pudding", linkLabel: "Protein-Pudding vergleichen" },
    ],
  },
  {
    id: "einordnen",
    title: "Werte einordnen",
    items: [
      {
        question: "Ab wann ist ein Lebensmittel proteinreich?",
        answer: `Nach EU-Verordnung 1924/2006 darf ein Produkt „Proteinquelle“ heißen, wenn mindestens ${proteinSourceMinShare * 100} % der Energie aus Protein stammen, und „hoher Proteingehalt“ ab ${highProteinMinShare * 100} %. Gerechnet wird mit 4 kcal pro Gramm Protein.`,
      },
      {
        question: "Wie viel Protein brauche ich am Tag?",
        answer: `Die DGE nennt für Erwachsene von 19 bis unter 65 Jahren 0,8 g pro Kilogramm Körpergewicht, ab 65 Jahren 1,0 g. Bei 75 kg sind das 60 g. Auf Verpackungen steht oft die EU-Referenzmenge von ${proteinReferenceIntakeGrams} g.`,
        href: "/de/proteinbedarf-rechner",
        linkLabel: "Proteinbedarf berechnen",
      },
      {
        question: "Was bedeutet Protein pro 100 kcal?",
        answer: densityAnswer(),
      },
    ],
  },
  {
    id: "daten",
    title: "Daten und Quellen",
    items: [
      {
        question: "Woher stammen die Werte?",
        answer: `Von Herstellerseiten, Händlerseiten wie REWE und dm sowie in Ausnahmen aus Nährwertdatenbanken. ${pages.filter((product) => product.verificationStatus === "manufacturer_verified").length} von ${pages.length} Produkten sind direkt beim Hersteller geprüft. Jede Produktseite nennt Quelle, Status und Prüfdatum.`,
      },
      {
        question: "Was mache ich, wenn ein Wert nicht zur Packung passt?",
        answer: "Rezepturen ändern sich. Über „Wert falsch? Hinweis senden“ auf jeder Produktseite kommt die Meldung direkt an; der Eintrag wird mit der neuen Quelle und dem Datum aktualisiert.",
      },
      {
        question: "Wie vergleiche ich Produkte direkt?",
        answer: "Im Vergleich lassen sich bis zu vier Produkte nebeneinander stellen, mit Protein pro 100 g, pro Portion und pro 100 kcal, Kalorien, Zucker, Fett und Salz.",
        href: "/de/produkte/vergleich",
        linkLabel: "Zum Vergleich",
      },
    ],
  },
];

export const faq = faqCategories.flatMap((category) => category.items);
export const faqSourceUrl = dgeProteinUrl;
