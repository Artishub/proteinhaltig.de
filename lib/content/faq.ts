export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqCategory = {
  id: string;
  title: string;
  intro: string;
  items: FaqItem[];
};

export const faqCategories: FaqCategory[] = [
  {
    id: "grundlagen",
    title: "Proteinwerte verstehen",
    intro: "Die wichtigsten Werte auf einen Blick.",
    items: [
      {
        question: "Was bedeutet Protein pro 100 g?",
        answer: "Der Wert macht Produkte unabhängig von der Packungsgröße vergleichbar. Bei Drinks steht derselbe Vergleich pro 100 ml.",
      },
      {
        question: "Warum zeigt die Seite zusätzlich Gesamtprotein?",
        answer: "Weil eine Packung selten genau 100 g hat. Gesamtprotein zeigt, wie viel Protein in Riegel, Becher, Drink oder Portion steckt.",
      },
      {
        question: "Was ist eine Proteinportion?",
        answer: "Proteinhaltig.de nutzt 10 g Protein als einfache Orientierungseinheit. Das ist kein Grenzwert, sondern eine schnelle Rechenhilfe.",
      },
    ],
  },
  {
    id: "daten",
    title: "Daten & Quellen",
    intro: "Wie die Produktdaten einzuordnen sind.",
    items: [
      {
        question: "Sind die Werte verifiziert?",
        answer: "Die aktuelle Version enthält MVP-Beispieldaten. Vor Veröffentlichung sollten Werte gegen Herstellerseite oder Verpackung geprüft werden.",
      },
      {
        question: "Warum fehlt ein Produkt?",
        answer: "Die Datenbank ist als Startversion angelegt und kann später über CSV, CMS oder Datenbankimporte wachsen.",
      },
      {
        question: "Ersetzt die Seite Ernährungsberatung?",
        answer: "Nein. Sie macht Nährwerte vergleichbar und ersetzt keine medizinische oder ernährungswissenschaftliche Beratung.",
      },
    ],
  },
  {
    id: "nutzung",
    title: "Suche & Vergleich",
    intro: "So findest du passende Produkte schneller.",
    items: [
      {
        question: "Wie vergleiche ich Proteinriegel?",
        answer: "Filtere nach Proteinriegeln und sortiere nach Protein pro 100 g oder Gesamtprotein pro Riegel.",
      },
      {
        question: "Wie finde ich Produkte einer Marke?",
        answer: "Nutze den Markenfilter oder die Markenseite. Beide führen zur gefilterten Produktsuche.",
      },
      {
        question: "Kann ich mehrere Produkte nebeneinander vergleichen?",
        answer: "Ja. In der Produktsuche kannst du bis zu drei Produkte in den Vergleich aufnehmen.",
      },
    ],
  },
];

export const faq = faqCategories.flatMap((category) => category.items);
