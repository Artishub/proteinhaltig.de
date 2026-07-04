export type Article = {
  slug: string;
  title: string;
  description: string;
  minutes: number;
  body: string[];
};

export const articles: Article[] = [
  {
    slug: "protein-pro-100g-verstehen",
    title: "Protein pro 100 g verstehen",
    description: "Warum Protein pro 100 g der faire Startpunkt für Riegel, Joghurt, Skyr und Pulver ist.",
    minutes: 3,
    body: [
      "Proteinprodukte wirken erst vergleichbar, wenn alle Werte auf derselben Basis stehen. Darum startet Proteinhaltig.de mit Protein pro 100 g oder 100 ml.",
      "Ein Riegel mit 35 g Protein pro 100 g klingt hoch. Bei 55 g Packungsgröße sind es aber rund 19 g pro Riegel. Ein Skyr mit 11 g pro 100 g liefert in einem 500-g-Becher deutlich mehr Gesamtprotein.",
      "Für den Alltag zählt beides: der normierte Wert für den fairen Vergleich und das Gesamtprotein pro Packung oder Portion.",
    ],
  },
  {
    slug: "proteinriegel-vergleichen",
    title: "Proteinriegel vergleichen",
    description: "Proteinriegel nach Protein pro 100 g, Protein pro Riegel und Nährwerten einordnen.",
    minutes: 3,
    body: [
      "Proteinriegel unterscheiden sich stark: Manche liefern vor allem Protein, andere sind eher ein Snack mit Proteinclaim.",
      "Vergleiche zuerst Protein pro 100 g, dann die Riegelgröße. Ein kleiner Riegel mit hohem Prozentwert kann weniger Protein liefern als ein größerer Riegel mit moderatem Wert.",
      "Zusätzlich lohnen sich Zucker, Fett, Kalorien und Ballaststoffe. Der höchste Proteinwert ist nicht automatisch das passendste Produkt.",
    ],
  },
  {
    slug: "protein-joghurt-skyr-quark",
    title: "Protein-Joghurt, Skyr und Quark",
    description: "Kühlregal-Produkte nach Protein pro 100 g und Bechergröße vergleichen.",
    minutes: 3,
    body: [
      "Protein-Joghurt, Skyr und Quark sind oft alltagstauglicher als Spezialprodukte, weil die Packungen größer und die Zutatenlisten kürzer sein können.",
      "Der 100-g-Wert zeigt die Dichte. Die Bechergröße zeigt, wie viel Protein tatsächlich zusammenkommt.",
      "Gerade bei 200-g- und 500-g-Packungen lohnt der Blick auf Gesamtprotein, Zucker und Kalorien pro Packung.",
    ],
  },
  {
    slug: "proteinpulver-portionsgroesse",
    title: "Proteinpulver und Portionsgröße",
    description: "Warum Pulver pro 100 g und pro Portion getrennt gelesen werden sollte.",
    minutes: 2,
    body: [
      "Proteinpulver hat sehr hohe Werte pro 100 g. Getrunken wird aber meist eine Portion von 25 bis 35 g.",
      "Darum zeigt Proteinhaltig.de Pulver mit einer Portionsgröße. So wird aus 76 g Protein pro 100 g ein realer Shake-Wert von etwa 23 g bei 30 g Pulver.",
      "Für genaue Planung zählt zusätzlich, womit das Pulver gemischt wird: Wasser, Milch oder Pflanzendrink ändern Kalorien und Proteinmenge.",
    ],
  },
  {
    slug: "pflanzliches-protein-vergleichen",
    title: "Pflanzliches Protein vergleichen",
    description: "Soja-, Erbsen- und andere pflanzliche Proteinprodukte fair einordnen.",
    minutes: 3,
    body: [
      "Pflanzliche Proteinprodukte brauchen denselben nüchternen Vergleich wie Milchprodukte: Protein pro 100 g oder 100 ml, Packungsgröße, Nährwerte.",
      "Ein Drink mit 5 g Protein pro 100 ml kann als 250-ml-Portion sinnvoll sein, liegt aber anders als ein Skyr oder Riegel.",
      "Der Produktvergleich hilft, Claims und Portionsgrößen auseinanderzuhalten.",
    ],
  },
];

export const articleBySlug = Object.fromEntries(articles.map((article) => [article.slug, article]));
