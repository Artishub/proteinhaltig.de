import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { brandById } from "@/lib/data/brands";
import { categoryById } from "@/lib/data/categories";
import { drinks, packageEnergyKcal, sugarCubes, totalSugarGrams, type Drink, type DrinkFaq } from "@/lib/data/drinks";
import { siteUrl } from "@/lib/site";

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
  const description = `${drink.name} von ${brandName}: ${proteinPart}, Nährwerte und Quelle.`;

  return {
    title: `${drink.name}: Protein pro 100 g/ml und Nährwerte`,
    description,
    alternates: { canonical: `/de/produkte/${drink.id}` },
    openGraph: {
      title: `${drink.name}: Protein pro 100 g/ml und Nährwerte`,
      description,
      url: `${siteUrl}/de/produkte/${drink.id}`,
      type: "article",
    },
  };
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
    <main className="mx-auto max-w-page px-4 py-10">
      <Link href="/de/produkte" className="focus-ring inline-flex items-center gap-2 rounded-md text-sm text-slate hover:text-ink">
        <ArrowLeft size={16} />
        Zurück zur Suche
      </Link>

      <section className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div>
          <p className="text-sm font-medium text-slate">{categoryName}</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight md:text-6xl">{drink.name}</h1>
          <p className="mt-4 text-lg leading-8 text-slate">
            {brandName} · {sizeLabel(drink)} · {formatOptionalGrams(drink.sugarPer100Ml)} Protein pro 100 g/ml
          </p>
          <p className="mt-6 max-w-2xl leading-7 text-slate">{introText(drink, brandName, categoryName)}</p>
          {drink.note && <p className="mt-4 max-w-2xl leading-7 text-slate">{drink.note}</p>}
          <div className="mt-6 flex flex-wrap gap-2 text-sm">
            <Link href={`/de/produkte?brand=${drink.brandId}`} className="focus-ring rounded-md border border-ash bg-mist px-3 py-2 hover:border-marigold">
              Mehr von {brandName}
            </Link>
            <Link href={`/de/produkte?category=${drink.categoryId}`} className="focus-ring rounded-md border border-ash bg-mist px-3 py-2 hover:border-marigold">
              Kategorie {categoryName}
            </Link>
            <Link href={knowledgeLink(drink)} className="focus-ring rounded-md border border-ash bg-mist px-3 py-2 hover:border-marigold">
              Passendes Wissen lesen
            </Link>
          </div>
        </div>

        <section className="rounded-lg border border-ash bg-mist p-5">
          <h2 className="text-xl font-semibold tracking-tight">Nährwerte</h2>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Nutrient label="Protein pro 100 g/ml" value={formatOptionalGrams(drink.sugarPer100Ml)} highlight />
            <Nutrient label="Protein pro Packung" value={formatOptionalGrams(totalProtein)} highlight />
            <Nutrient label="Proteinportionen" value={formatOptionalNumber(portions)} />
            <Nutrient label="Energie pro Packung" value={energy === null ? "/" : `${formatNumber(energy)} kcal`} />
            <Nutrient label="Energie pro 100 g/ml" value={drink.nutritionPer100Ml ? `${formatNumber(drink.nutritionPer100Ml.energyKcal)} kcal / ${formatNumber(drink.nutritionPer100Ml.energyKj)} kJ` : "/"} />
            <Nutrient label="Kohlenhydrate" value={drink.nutritionPer100Ml ? `${formatNumber(drink.nutritionPer100Ml.carbohydrates)} g` : "/"} />
            <Nutrient label="Fett" value={drink.nutritionPer100Ml ? `${formatNumber(drink.nutritionPer100Ml.fat)} g` : "/"} />
            <Nutrient label="Eiweiß" value={drink.nutritionPer100Ml ? `${formatNumber(drink.nutritionPer100Ml.protein)} g` : "/"} />
            <Nutrient label="Salz" value={drink.nutritionPer100Ml ? `${formatNumber(drink.nutritionPer100Ml.salt)} g` : "/"} />
            <Nutrient label="Packung" value={sizeLabel(drink)} />
          </div>
          <p className="mt-4 text-xs leading-5 text-slate">Alle Angaben beziehen sich auf die hinterlegten Produktdaten und können sich durch Rezeptur- oder Verpackungsänderungen unterscheiden.</p>
        </section>
      </section>

      <section className="mt-10 grid gap-6 border-t border-ash pt-8 lg:grid-cols-[1fr_1fr]">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Einordnung</h2>
          <p className="mt-3 leading-7 text-slate">
            Der Wert pro 100 g/ml macht {drink.name} mit anderen Produkten vergleichbar. Das Gesamtprotein zeigt, welche Menge Protein in der ganzen Packung oder Portion steckt.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Quelle</h2>
          <p className="mt-3 leading-7 text-slate">{drink.source}</p>
          {drink.sourceUrl && (
            <a href={drink.sourceUrl} target="_blank" rel="noreferrer" className="focus-ring mt-3 inline-flex items-center gap-2 rounded-md text-sm font-medium underline decoration-ash underline-offset-4 hover:decoration-marigold">
              Quelle öffnen <ExternalLink size={15} />
            </a>
          )}
          {drink.lastCheckedAt && <p className="mt-3 text-sm text-slate">Zuletzt geprüft: {formatDate(drink.lastCheckedAt)}</p>}
        </div>
      </section>

      <section className="mt-10 border-t border-ash pt-8">
        <h2 className="text-2xl font-semibold tracking-tight">FAQ zu {drink.name}</h2>
        <div className="mt-5 divide-y divide-ash">
          {faqs.map((item) => (
            <details key={item.question} className="group py-4">
              <summary className="cursor-pointer list-none font-semibold">{item.question}</summary>
              <p className="mt-3 max-w-3xl leading-7 text-slate">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-10 border-t border-ash pt-8">
        <h2 className="text-2xl font-semibold tracking-tight">Ähnliche Produkte</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {similar.map((item) => {
            const similarBrand = brandById[item.brandId]?.name ?? "Marke";
            return (
              <Link key={item.id} href={`/de/produkte/${item.id}`} className="rounded-lg border border-ash bg-paper p-4 hover:border-marigold">
                <p className="font-semibold">{item.name}</p>
                <p className="mt-1 text-sm text-slate">{similarBrand} · {sizeLabel(item)}</p>
                <p className="mt-4 text-sm tabular-nums">{formatOptionalGrams(item.sugarPer100Ml)} / 100 g/ml</p>
              </Link>
            );
          })}
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
    <div className="rounded-md border border-ash bg-paper p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate">{label}</p>
      <p className={`mt-2 tabular-nums ${highlight ? "text-2xl font-semibold" : "text-lg font-semibold"}`}>{value}</p>
    </div>
  );
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
      answer: `Die gespeicherten Werte basieren auf der hinterlegten Quelle: ${drink.source}. Produktwerte können sich ändern und sollten bei Bedarf auf der Verpackung geprüft werden.`,
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
