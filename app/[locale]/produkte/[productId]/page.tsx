import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink, Info } from "lucide-react";
import { brandById } from "@/lib/data/brands";
import { categoryById } from "@/lib/data/categories";
import { drinks, packageEnergyKcal, sugarCubes, totalSugarGrams, verificationLabel, type Drink, type DrinkFaq } from "@/lib/data/drinks";
import { pageMetadata } from "@/lib/seo";
import { siteUrl } from "@/lib/site";
import styles from "./product-detail.module.css";

type PageProps = {
  params: Promise<{ productId: string; locale: string }>;
};

export function generateStaticParams() {
  return drinks.map((drink) => ({ productId: drink.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { productId } = await params;
  const drink = drinks.find((item) => item.id === productId);

  if (!drink) return { title: "Produkt nicht gefunden" };

  const brandName = brandById[drink.brandId]?.name ?? "Unbekannte Marke";
  const totalProtein = totalSugarGrams(drink);
  const packagePart = drink.sizeMl && totalProtein !== null ? `, ${formatNumber(totalProtein)} g pro ${sizeLabel(drink)}` : "";
  const proteinPart = drink.sugarPer100Ml === null ? "Proteinwert noch nicht verifiziert" : `${formatNumber(drink.sugarPer100Ml)} g Protein pro 100 g/ml${packagePart}`;
  const description = `${drink.name} von ${brandName}: ${proteinPart}. Mit Nährwerten, Packung und Quelle.`;
  const title = productMetaTitle(drink.name, brandName);

  return pageMetadata({
    title,
    description,
    path: `/de/produkte/${drink.id}`,
    type: "article",
    absoluteTitle: title,
  });
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { productId } = await params;
  const drink = drinks.find((item) => item.id === productId);

  if (!drink) notFound();

  const brandName = brandById[drink.brandId]?.name ?? "Unbekannte Marke";
  const categoryName = categoryById[drink.categoryId]?.name ?? "Produkt";
  const totalProtein = totalSugarGrams(drink);
  const portions = sugarCubes(drink);
  const energy = packageEnergyKcal(drink);
  const similar = similarDrinks(drink);
  const faqs = generatedFaq(drink, brandName);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <Link href="/de/produkte" className={styles.back}><ArrowLeft size={16} /> Zur Produktsuche</Link>
        <div className={styles.heroGrid}>
          <div>
            <p className={styles.category}>{categoryName} · {sizeLabel(drink)}</p>
            <h1>Wie viel Protein hat {drink.name}?</h1>
            <p className={styles.summary}>{introText(drink, brandName, categoryName)}</p>
            {drink.note && <p className={styles.note}>{drink.note}</p>}
            <p className={styles.sourceLine}><Info size={15} /> Quelle: {drink.source} · {verificationLabel(drink)}</p>
            <div className={styles.topicLinks}>
              <Link href={`/de/produkte?brand=${drink.brandId}`}>Mehr von {brandName}</Link>
              <Link href={`/de/produkte?category=${drink.categoryId}`}>Kategorie {categoryName}</Link>
            </div>
          </div>
          <div className={styles.proteinPanel}>
            <p>{brandName}</p>
            <div><strong>{formatOptionalNumber(totalProtein)}</strong><span>g Protein</span></div>
            <div className={styles.portionSummary}>
              <p>pro {sizeLabel(drink)} · {formatOptionalNumber(portions)} Portionen à 10 g</p>
              <div className={styles.blocks} aria-hidden="true">
                {Array.from({ length: proteinBlockCount(portions) }).map((_, index) => <i key={index} />)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.facts} aria-label={`Werte für ${drink.name}`}>
        <Nutrient label="Protein pro 100 g/ml" value={formatOptionalGrams(drink.sugarPer100Ml)} highlight />
        <Nutrient label={`Protein pro ${sizeLabel(drink)}`} value={formatOptionalGrams(totalProtein)} highlight />
        <Nutrient label="10-g-Proteinportionen" value={formatOptionalNumber(portions)} />
        <Nutrient label="Energie pro Packung" value={energy === null ? "/" : `${formatNumber(energy)} kcal`} />
      </section>

      <section className={styles.contentGrid}>
        <div className={styles.nutrition}>
          <p className={styles.category}>Nährwerte</p>
          <h2>Pro 100 g/ml</h2>
          <div className={styles.nutrientGrid}>
            <Nutrient label="Energie" value={drink.nutritionPer100Ml ? `${formatNumber(drink.nutritionPer100Ml.energyKcal)} kcal / ${formatNumber(drink.nutritionPer100Ml.energyKj)} kJ` : "/"} />
            <Nutrient label="Protein" value={formatOptionalGrams(drink.sugarPer100Ml)} />
            <Nutrient label="Kohlenhydrate" value={drink.nutritionPer100Ml ? `${formatNumber(drink.nutritionPer100Ml.carbohydrates)} g` : "/"} />
            <Nutrient label="Fett" value={drink.nutritionPer100Ml ? `${formatNumber(drink.nutritionPer100Ml.fat)} g` : "/"} />
            <Nutrient label="Eiweiß laut Nährwerttabelle" value={drink.nutritionPer100Ml ? `${formatNumber(drink.nutritionPer100Ml.protein)} g` : "/"} />
            <Nutrient label="Salz" value={drink.nutritionPer100Ml ? `${formatNumber(drink.nutritionPer100Ml.salt)} g` : "/"} />
          </div>
        </div>
        <aside className={styles.sourceCard}>
          <p className={styles.category}>Datenquelle</p>
          <h2>Nachprüfbar.</h2>
          <p>{drink.source}</p>
          <p>{verificationLabel(drink)}</p>
          <p className={styles.sourceNote}>Produktwerte können sich durch Rezeptur- oder Verpackungsänderungen ändern.</p>
          {drink.lastCheckedAt && <p className={styles.checked}>Zuletzt geprüft: {formatDate(drink.lastCheckedAt)}</p>}
          {drink.sourceUrl && <a href={drink.sourceUrl} target="_blank" rel="noreferrer">Quelle öffnen <ExternalLink size={16} /></a>}
        </aside>
      </section>

      <section className={styles.compare}>
        <div><h2>Ähnliche Produkte.</h2></div>
        <div className={styles.related}>
          {similar.map((item) => {
            const similarBrand = brandById[item.brandId]?.name ?? "Marke";
            return (
              <Link key={item.id} href={`/de/produkte/${item.id}`}>
                <span>{similarBrand}</span>
                <strong>{item.name}</strong>
                <b>{formatOptionalGrams(item.sugarPer100Ml)} / 100 g/ml</b>
                <ArrowRight size={16} />
              </Link>
            );
          })}
        </div>
      </section>

      <section className={styles.faq}>
        <p className={styles.category}>Fragen und Antworten</p>
        <h2>FAQ zu {drink.name}</h2>
        <div>
          {faqs.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}
        </div>
        <div className={styles.knowledgeLinks}>
          <Link href={knowledgeLink(drink)} className={styles.knowledge}>Passendes Wissen <ArrowRight size={16} /></Link>
          <Link href={`/de/produkte?brand=${drink.brandId}`} className={styles.knowledge}>Alle Produkte von {brandName} <ArrowRight size={16} /></Link>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqs.map((item) => ({
                "@type": "Question",
                name: item.question,
                acceptedAnswer: { "@type": "Answer", text: item.answer },
              })),
            },
            breadcrumbJsonLd(drink),
          ]),
        }}
      />
    </main>
  );
}

function Nutrient({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={highlight ? styles.nutrientHighlight : styles.nutrient}>
      <p>{label}</p>
      <p>{value}</p>
    </div>
  );
}

function proteinBlockCount(portions: number | null) {
  if (portions === null) return 0;
  return Math.min(Math.max(Math.round(portions), 1), 24);
}

function similarDrinks(drink: Drink) {
  return drinks
    .filter((item) => item.id !== drink.id && (item.categoryId === drink.categoryId || item.brandId === drink.brandId))
    .sort((a, b) => Math.abs((a.sugarPer100Ml ?? 0) - (drink.sugarPer100Ml ?? 0)) - Math.abs((b.sugarPer100Ml ?? 0) - (drink.sugarPer100Ml ?? 0)))
    .slice(0, 4);
}

function generatedFaq(drink: Drink, brandName: string): DrinkFaq[] {
  const totalProtein = totalSugarGrams(drink);
  const portions = sugarCubes(drink);

  return [
    {
      question: `Wie viel Protein hat ${drink.name}?`,
      answer:
        drink.sugarPer100Ml === null
          ? `${drink.name} von ${brandName} hat bereits eine Quelle, der Proteinwert ist aber noch nicht verifiziert.`
          : totalProtein === null || !drink.sizeMl
          ? `${drink.name} von ${brandName} enthält ${formatNumber(drink.sugarPer100Ml)} g Protein pro 100 g/ml. Eine Packungsgröße ist noch nicht hinterlegt.`
          : `${drink.name} von ${brandName} enthält ${formatNumber(drink.sugarPer100Ml)} g Protein pro 100 g/ml. Bei ${sizeLabel(drink)} ergibt das rechnerisch ${formatNumber(totalProtein)} g Protein pro Packung.`,
    },
    {
      question: `Wie viele Proteinportionen stecken in ${drink.name}?`,
      answer:
        portions === null || !drink.sizeMl
          ? "Die Proteinportionen pro Packung werden ergänzt, sobald eine Packungsgröße hinterlegt ist."
          : `Bei 10 g pro Proteinportion entspricht das ungefähr ${formatNumber(portions)} Proteinportionen pro ${sizeLabel(drink)}.`,
    },
    {
      question: "Warum ist der Wert pro 100 g/ml wichtig?",
      answer: `Der Wert pro 100 g/ml macht ${drink.name} unabhängig von der Packungsgröße mit anderen Produkten vergleichbar.`,
    },
    {
      question: `Woher stammen die Werte zu ${drink.name}?`,
      answer: `Die gespeicherten Werte basieren auf der hinterlegten Quelle: ${drink.source}. Status: ${verificationLabel(drink)}. Produktwerte können sich ändern und sollten bei Bedarf auf der Verpackung geprüft werden.`,
    },
  ];
}

function introText(drink: Drink, brandName: string, categoryName: string) {
  const totalProtein = totalSugarGrams(drink);
  const portions = sugarCubes(drink);
  const base =
    totalProtein === null || portions === null || !drink.sizeMl
      ? "Eine Packungsgröße ist noch nicht hinterlegt; Gesamtprotein und Proteinportionen werden deshalb als / angezeigt."
      : `Für ${sizeLabel(drink)} ergeben sich rechnerisch ${formatNumber(totalProtein)} g Protein. Das entspricht ungefähr ${formatNumber(portions)} Proteinportionen bei 10 g pro Portion.`;

  return `${drink.name} ist in der Datenbank als ${categoryName} von ${brandName} gespeichert. ${base}`;
}

function knowledgeLink(drink: Drink) {
  if (drink.categoryId === "protein-bar") return "/de/wissen/proteinriegel-vergleichen";
  if (drink.categoryId === "protein-yogurt" || drink.categoryId === "skyr-quark") return "/de/wissen/protein-joghurt-skyr-quark";
  if (drink.categoryId === "protein-powder") return "/de/wissen/proteinpulver-portionsgroesse";
  if (drink.categoryId === "plant-protein") return "/de/wissen/pflanzliches-protein-vergleichen";
  return "/de/wissen/protein-pro-100g-verstehen";
}

function breadcrumbJsonLd(drink: Drink) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Startseite", item: `${siteUrl}/de` },
      { "@type": "ListItem", position: 2, name: "Produkte", item: `${siteUrl}/de/produkte` },
      { "@type": "ListItem", position: 3, name: drink.name, item: `${siteUrl}/de/produkte/${drink.id}` },
    ],
  };
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 }).format(value);
}

function formatOptionalNumber(value: number | null) {
  return value === null ? "/" : formatNumber(value);
}

function formatOptionalGrams(value: number | null) {
  return value === null ? "/" : `${formatNumber(value)} g`;
}

function sizeLabel(drink: Drink) {
  return drink.sizeMl ? `${drink.sizeMl} ${drink.packageUnit ?? "g"}` : "/";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-DE").format(new Date(value));
}

function shortTitle(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  const shortened = value.slice(0, maxLength - 3);
  const lastSpace = shortened.lastIndexOf(" ");
  return `${shortened.slice(0, lastSpace > 20 ? lastSpace : maxLength - 3)}...`;
}

function productMetaTitle(productName: string, brandName: string) {
  const suffix = ": Protein & Nährwerte";
  const maxProductLength = 60 - brandName.length - suffix.length - 1;
  return `${brandName} ${shortTitle(productName, maxProductLength)}${suffix}`;
}
