# Redesign- und SEO-Playbook proteinhaltig.de

Stand: 5. Oktober 2026. Übertragen vom Playbook in `artishub/zuckerhaltig.de` (`docs/redesign-playbook.md`) und an Protein angepasst. Code-Pfade beziehen sich auf dieses Repo.

---

## 1. Ausgangslage

### Search Console (Export 3 Monate, Stand 02.10.2026)

| Zeitraum | Impressionen/Tag | Ø Position |
|---|---|---|
| Mitte – Ende Juli | 55–90 | 15–23 |
| August | 80–165 | 10–16 |
| ab Mitte September | 270–390 | 8–10 |

- **Kein Absturz am 27.07.** wie bei zuckerhaltig.de. Die Seite wächst seit dem Start.
- 14.579 Impressionen, 79 Klicks, Klickrate 0,54 %. 65 % der Impressionen kommen vom Handy.
- **475 von 548 Produktseiten haben Impressionen**, 60 davon Klicks. Die Nachfrage ist breit verteilt, nur 20 Seiten liegen über 100 Impressionen.
- Nachfrage nach Kategorie: Pulver 51 %, Skyr/Quark 13 %, Drinks 9 %, pflanzlich 9 %, Riegel 8 %. Nach Marke: ESN 36 %, dm Sportness 10 %, Arla 9 %, More 8 %.
- **Lücken:** Skyr, Quark und Protein-Joghurt (zwei Skyr-Seiten bekamen 1.858 Impressionen, allgemeine Suchen stehen auf Platz 70–80), dm als Marke, Portionsangaben („nährwerte 30 g“).
- Die Domain ohne www leitete per 302 und dann 308 weiter. Das muss eine einzelne 301 in Cloudflare/Coolify sein; die Middleware fängt Anfragen ohne www zusätzlich ab.

### Was daraus folgt

1. **Kein Massen-noindex.** Anders als auf zuckerhaltig hätte die Allowlist hier funktionierende Seiten abgeschaltet. Stattdessen wurden die Spam-Muster entfernt, bevor sie greifen.
2. Die Allowlist (`lib/data/indexed-products.json`) enthält alle bisher indexierten Produktseiten als Basis. Neue Seiten kommen nur in Wellen von höchstens 15–20 dazu.
3. Eine Seite pro Produkt: Größenvarianten leiten auf die Größe mit den meisten Impressionen weiter.

---

## 2. Umgesetzt

| Phase | Änderung | Dateien |
|---|---|---|
| 1 | Footer-Querlinks zu zuckerhaltig.de und aivergleich.de entfernt | `app/[locale]/layout.tsx` |
| 1 | Cookie-Banner mit echter Einwilligung, Widerruf im Footer, neue Datenschutzerklärung | `components/cookie-consent.tsx`, `app/[locale]/datenschutz/page.tsx` |
| 1 | 404 gibt nur `noindex` aus | `app/layout.tsx` |
| 1 | Seed nur mit Quelldaten, neue Feldnamen, Prüfung verbietet `faq`/`computed` | `lib/data/products.seed.json`, `scripts/validate-products-data.mjs` |
| 1 | 2.192 generierte FAQ-Antworten, FAQPage-Schema und Intro-Baustein entfernt | `app/[locale]/produkte/[productId]/page.tsx` |
| 1 | Eine Seite pro Produkt, Weiterleitungen in der Middleware | `lib/page-routing.ts`, `lib/product-redirects.ts`, `middleware.ts` |
| 1 | Produktliste blendete 334 Produkte aus (Max-Regler), behoben | `components/product-explorer.tsx` |
| 1 | `CLAUDE.md`, Skills, `npm run product`, Lint, Tests, `seo:check`, CI | `.claude/skills/`, `scripts/` |
| 2 | Protein-Logik mit geprüften Quellen | `lib/protein-context.ts`, `lib/product-facts.ts` |
| 3 | Eigene Farbwelt, Schrift, Logo, Startseite, Streudiagramm | `app/globals.css`, `components/ui/`, `components/home-page.tsx` |
| 4 | Marken- und Kategorieseiten, Proteinbedarf-Rechner, 30-g-Kombinationen (noindex bis Freigabe) | `app/[locale]/marken/[brandId]`, `app/[locale]/kategorien/[categoryId]`, `app/[locale]/proteinbedarf-rechner` |
| 4 | 22 Skyr-, Quark- und Joghurtprodukte von REWE (noindex bis Freigabe) | `lib/data/products.seed.json` |

---

## 3. Protein-Logik

Alle Werte am 05.10.2026 an der Originalquelle geprüft.

| Kennzahl | Wert | Quelle |
|---|---|---|
| „Proteinquelle“ | mindestens 12 % der Energie aus Protein | VO (EG) 1924/2006, Anhang |
| „hoher Proteingehalt“ | mindestens 20 % der Energie aus Protein | VO (EG) 1924/2006, Anhang |
| Umrechnung | 1 g Protein = 4 kcal (17 kJ) | VO (EU) 1169/2011, Anhang XIV |
| Referenzmenge | 50 g Eiweiß pro Tag | VO (EU) 1169/2011, Anhang XIII Teil B |
| Bedarf Erwachsene | 0,8 g pro kg (19 bis unter 65), 1,0 g pro kg ab 65 | DGE-Pressemeldung 08/2017 |

- **540 von 548 Produkten erreichen 20 %.** Ein Badge „hoher Proteingehalt“ würde fast überall dasselbe sagen. Die Einstufung erscheint deshalb nur als Hilfslinie im Streudiagramm und als Fakt auf den wenigen Seiten, die darunter liegen.
- Unterscheidend sind Protein pro 100 kcal (Proteindichte) und der Rang in der Kategorie.
- **Heldenzahl:** pro Portion, wenn die Quelle eine nennt; pro Packung bei Einzelportionen (Riegel, Becher, Flasche); sonst pro 100 g (Pulver, Großpackungen). Siehe `lib/product-hero.ts`.
- **Alternative:** mindestens 10 % mehr Protein bei höchstens 10 % mehr kcal pro 100 g, gleiche Kategorie, gleiche Marke bevorzugt.
- **Anschauliche Einheit:** keine. Die frühere „10-g-Proteinportion“ war nicht belegt und ist entfernt. Stattdessen gibt es einen Balken zur 50-g-Referenz.

---

## 4. Design: bewusst anders als zuckerhaltig.de

| | zuckerhaltig.de | proteinhaltig.de |
|---|---|---|
| Akzent | Lime `#d8f36a` auf Moos `#1f4539` | Terrakotta `#e8693a` auf Espresso `#2a1f1a` |
| Fläche | kühles Grün-Grau `#edf0e8` | warmes Off-White `#f6f2ec` |
| Schrift | Systemschrift, Gewicht 750, Laufweite −0,04 em | Space Grotesk für Überschriften und Zahlen, Gewicht 600, −0,025 em |
| Showcase | um −1,5° gedrehte Karte mit Lime-Kreis | gerade Karte, eine eckige Ecke oben links, 6-px-Akzentkante oben, Kalorien-Split |
| Hauptgrafik | Zuckerskala (Strip-Plot pro Kategorie) | Streudiagramm Protein gegen kcal mit 12-%- und 20-%-Linie |
| Logo | 2×2-Quadrate | drei steigende Balken |

Kontraste (WCAG): Text auf Fläche 15,5:1, Sekundärtext 6,9:1, Akzenttext `#a8401f` 5,5:1, im Dunkelmodus `#ff9a70` 9:1. Diagrammfarben mit dem Dataviz-Validator geprüft: Punkte `#e8693a` auf der Bühne; Kalorien-Split Protein `#e8693a`, Kohlenhydrate `#c98500`, Fett `#3987e5` (farbfehlsichtig unterscheidbar, immer mit Textlabel).

Rauschen entfernt wie auf zuckerhaltig: keine großgeschriebenen Eyebrows, keine Punkte in Überschriften, keine Slogans, keine „01/02/03“-Karten, keine Badges mit Einheitsaussage, keine generierten FAQ.

---

## 5. Offene Punkte

- **Indexierung freigeben** (jeweils eine Welle): Marken- und Kategorieseiten, `/de/proteinbedarf-rechner`, die 20 neuen Skyr-/Quark-/Joghurtseiten. Listen in `lib/seo-index.ts` und `lib/data/indexed-products.json`.
- **Cloudflare/Coolify:** Domain ohne www per einzelner 301 auf `https://www.proteinhaltig.de/de`.
- **Daten:**
  - 5 ESN-Designer-Whey-Sorten nutzen einen Yazio-Familienwert statt Sortenwerten.
  - 20 Quellen stammen aus UK/AU/ES/CH.
  - 8 Produkte haben auffällige kcal-Werte (`VERBOSE=1 npm run validate:data`).
- **Portionen:** `servingSize` ist erst bei 7 Produkten belegt. Für Pulver die Herstellerportion nachtragen, jeweils mit Quelle.
- **Preis pro 10 g Protein:** erst mit belegter, datierter Preisquelle.
- Google Analytics nutzt dieselbe Property wie zuckerhaltig.de (`G-4W55FH97DW`). Eine eigene Property trennt die Daten sauber.
