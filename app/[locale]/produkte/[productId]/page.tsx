import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ExternalLink } from "lucide-react";
import { EnergySplit } from "@/components/ui/energy-split";
import { brandById } from "@/lib/data/brands";
import { categoryById } from "@/lib/data/categories";
import {
  packageEnergyKcal,
  packageProtein,
  products,
  proteinEnergyShare,
  proteinPer100,
  proteinPer100Kcal,
  servingProtein,
  sizeLabel,
  verificationLabel,
  type Product,
} from "@/lib/data/products";
import { isProductPage, productPageHref, productPageSizes, sizeAnchor } from "@/lib/page-routing";
import { heroAmount, type HeroAmount } from "@/lib/product-hero";
import { productFacts } from "@/lib/product-facts";
import {
  categoryPeers,
  higherProteinAlternatives,
  proteinReferenceIntakeGrams,
  euLabellingRegulationUrl,
  referenceIntakeShare,
} from "@/lib/protein-context";
import { pageMetadata } from "@/lib/seo";
import { isSearchIndexableProduct } from "@/lib/seo-index";
import { contactEmail, siteUrl } from "@/lib/site";
import styles from "./product-detail.module.css";

type PageProps = {
  params: Promise<{ productId: string; locale: string }>;
};

export function generateStaticParams() {
  return products.filter(isProductPage).map((product) => ({ productId: product.id }));
}

function findProduct(productId: string) {
  return products.find((item) => item.id === productId);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { productId } = await params;
  const product = findProduct(productId);
  if (!product) return { title: "Produkt nicht gefunden", robots: { index: false, follow: true } };

  const brandName = brandById[product.brandId]?.name ?? "";
  const hero = heroAmount(product);
  const per100 = `${formatNumber(proteinPer100(product))} g pro 100 ${product.unit}`;
  const lead = hero.basis === "per100" ? `${formatNumber(proteinPer100(product))} g Protein pro 100 ${product.unit}` : `${formatNumber(hero.grams)} g Protein ${hero.label}, ${per100}`;
  const core = `${brandName} ${product.name}: ${lead}, ${Math.round(product.nutritionPer100.energyKcal)} kcal pro 100 ${product.unit}.`;
  // Snippets cut at about 160 characters; add the closing sentence only when it fits.
  const suffix = " Mit Nährwerten, Quelle und Vergleich.";
  const description = core.length + suffix.length <= 160 ? `${core}${suffix}` : core;
  const title = productMetaTitle(product.name, brandName);

  return {
    ...pageMetadata({ title, description, path: `/de/produkte/${product.id}`, type: "article", absoluteTitle: title }),
    robots: isSearchIndexableProduct(product) ? { index: true, follow: true } : { index: false, follow: true },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { productId } = await params;
  const product = findProduct(productId);
  if (!product) notFound();

  const brandName = brandById[product.brandId]?.name ?? "";
  const categoryName = categoryById[product.categoryId]?.name ?? "Produkt";
  const fullName = `${brandName} ${product.name}`.trim();
  const hero = heroAmount(product);
  const nutrition = product.nutritionPer100;
  const energyShare = proteinEnergyShare(product);
  const density = proteinPer100Kcal(product);
  const facts = productFacts(product);
  const alternatives = higherProteinAlternatives(product);
  const sizes = productPageSizes(product);
  const similar = similarProducts(product, new Set(alternatives.map((item) => item.id)));
  const portionColumn = hero.basis === "per100" ? null : hero;
  const referenceShare = portionColumn ? referenceIntakeShare(portionColumn.grams) : null;

  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <nav aria-label="Brotkrumen" className={styles.breadcrumb}>
          <Link href="/de">Startseite</Link>
          <span aria-hidden="true">/</span>
          <Link href="/de/produkte">Produkte</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{product.name}</span>
        </nav>

        <header className={styles.header}>
          <div>
            <p className={styles.meta}>{brandName} · {categoryName} · {sizeLabel(product)}</p>
            <h1>Wie viel Protein hat {fullName}?</h1>
            <p className={styles.answer}>{answerText(product, fullName, hero)}</p>
            <p className={styles.sourceLine}>
              Quelle: {product.source} · {verificationLabel(product)} · geprüft am {formatDate(product.lastCheckedAt)}
            </p>
          </div>

          <section className={styles.factCard} aria-label={`Protein in ${fullName}`}>
            <p className={styles.factLabel}>{hero.basis === "per100" ? `Protein pro 100 ${product.unit}` : `Protein ${hero.label}`}</p>
            <p className={styles.heroNumber}><strong>{formatNumber(hero.grams)}</strong><span>g</span></p>
            {referenceShare !== null && (
              <div className={styles.reference}>
                <div className={styles.referenceBar} aria-hidden="true">
                  <i style={{ width: `${Math.min(referenceShare, 100)}%` }} />
                </div>
                <p>
                  {referenceShare} % der <a href={euLabellingRegulationUrl} target="_blank" rel="noreferrer">Referenzmenge</a> von {proteinReferenceIntakeGrams} g pro Tag
                </p>
              </div>
            )}
            <dl className={styles.factGrid}>
              {hero.basis !== "per100" && (
                <div><dt>pro 100 {product.unit}</dt><dd>{formatNumber(proteinPer100(product))} g</dd></div>
              )}
              <div><dt>Energie pro 100 {product.unit}</dt><dd>{Math.round(nutrition.energyKcal)} kcal</dd></div>
              {energyShare !== null && <div><dt>Energie aus Protein</dt><dd>{Math.round(energyShare * 100)} %</dd></div>}
              {density !== null && <div><dt>Protein pro 100 kcal</dt><dd>{formatNumber(density)} g</dd></div>}
              {hero.basis === "per100" && product.packageSize && (
                <div><dt>pro Packung ({product.packageSize} {product.unit})</dt><dd>{formatNumber(packageProtein(product) ?? 0)} g</dd></div>
              )}
            </dl>
            <EnergySplit nutrition={nutrition} onStage />
          </section>
        </header>

        {facts.length > 0 && (
          <section className={styles.section} aria-labelledby="einordnung">
            <h2 id="einordnung">Ist das viel?</h2>
            <ul className={styles.factList}>
              {facts.map((fact) => (
                <li key={fact.id}>
                  <span>{fact.label}</span>
                  <p>{fact.text}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {alternatives.length > 0 && (
          <section className={styles.section} aria-labelledby="mehr-protein">
            <h2 id="mehr-protein">Mehr Protein, ähnliche Kalorien</h2>
            <p className={styles.sectionLead}>
              Gleiche Kategorie, mindestens 10 % mehr Protein und höchstens 10 % mehr kcal pro 100 {product.unit}.
            </p>
            <div className={styles.swapGrid}>
              {alternatives.map((item) => (
                <article key={item.id} className={styles.swapCard}>
                  <p className={styles.swapBrand}>{brandById[item.brandId]?.name}</p>
                  <h3><Link href={productPageHref(item)}>{item.name}</Link></h3>
                  <p className={styles.swapValue}>
                    <strong>{formatNumber(proteinPer100(item))} g</strong> statt {formatNumber(proteinPer100(product))} g pro 100 {item.unit}
                  </p>
                  <p className={styles.swapMeta}>{Math.round(item.nutritionPer100.energyKcal)} kcal statt {Math.round(nutrition.energyKcal)} kcal</p>
                  <div data-buy-slot={item.id} />
                </article>
              ))}
            </div>
          </section>
        )}

        {sizes.length > 1 && (
          <section className={styles.section} aria-labelledby="groessen">
            <h2 id="groessen">Packungsgrößen</h2>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr><th scope="col">Größe</th><th scope="col">Protein pro 100 {product.unit}</th><th scope="col">Protein gesamt</th><th scope="col">kcal gesamt</th></tr>
                </thead>
                <tbody>
                  {sizes.map((item) => (
                    <tr key={item.id} id={sizeAnchor(item)} className={item.id === product.id ? styles.activeRow : undefined}>
                      <th scope="row">{sizeLabel(item)}</th>
                      <td>{formatNumber(proteinPer100(item))} g</td>
                      <td>{formatOptional(packageProtein(item) ?? servingProtein(item), " g")}</td>
                      <td>{formatOptional(packageEnergyKcal(item), " kcal")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className={styles.twoColumn} aria-label="Nährwerte und Quelle">
          <div className={styles.labelCard}>
            <h2>Nährwerte</h2>
            <table className={styles.nutritionTable}>
              <thead>
                <tr>
                  <th scope="col"><span className="sr-only">Nährstoff</span></th>
                  <th scope="col">pro 100 {product.unit}</th>
                  {portionColumn && <th scope="col">{portionColumn.label.replace(/^pro /, "")}</th>}
                </tr>
              </thead>
              <tbody>
                <NutritionRow label="Energie" per100={`${formatNumber(nutrition.energyKcal)} kcal`} portion={portionColumn && `${formatNumber(Math.round(scale(nutrition.energyKcal, portionColumn.size)))} kcal`} />
                <NutritionRow label="Fett" per100={`${formatNumber(nutrition.fat)} g`} portion={portionColumn && `${formatNumber(scale(nutrition.fat, portionColumn.size))} g`} />
                <NutritionRow label="Kohlenhydrate" per100={`${formatNumber(nutrition.carbohydrates)} g`} portion={portionColumn && `${formatNumber(scale(nutrition.carbohydrates, portionColumn.size))} g`} />
                <NutritionRow label="davon Zucker" per100={`${formatNumber(nutrition.sugar)} g`} portion={portionColumn && `${formatNumber(scale(nutrition.sugar, portionColumn.size))} g`} indent />
                <NutritionRow label="Eiweiß" per100={`${formatNumber(nutrition.protein)} g`} portion={portionColumn && `${formatNumber(portionColumn.grams)} g`} strong />
                {nutrition.salt !== null && (
                  <NutritionRow label="Salz" per100={`${formatNumber(nutrition.salt)} g`} portion={portionColumn && `${formatNumber(scale(nutrition.salt, portionColumn.size))} g`} />
                )}
              </tbody>
            </table>
          </div>

          <aside className={styles.sourceCard} aria-labelledby="quelle">
            <h2 id="quelle">Quelle</h2>
            <dl>
              <div><dt>Angabe</dt><dd>{product.source}</dd></div>
              <div><dt>Status</dt><dd>{verificationLabel(product)}</dd></div>
              <div><dt>Geprüft am</dt><dd>{formatDate(product.lastCheckedAt)}</dd></div>
              {portionColumn && (
                <div>
                  <dt>Rechenweg</dt>
                  <dd>{formatNumber(proteinPer100(product))} g × {portionColumn.size} {product.unit} ÷ 100 = {formatNumber(portionColumn.grams)} g Protein</dd>
                </div>
              )}
            </dl>
            <div className={styles.sourceLinks}>
              <a href={product.sourceUrl} target="_blank" rel="noreferrer">Quelle öffnen <ExternalLink size={15} strokeWidth={1.75} aria-hidden="true" /></a>
              <a href={`mailto:${contactEmail}?subject=${encodeURIComponent(`Wert prüfen: ${fullName}`)}`}>Wert falsch? Hinweis senden</a>
            </div>
          </aside>
        </section>

        {similar.length > 0 && (
          <section className={styles.section} aria-labelledby="aehnlich">
            <h2 id="aehnlich">Ähnliche Produkte</h2>
            <ul className={styles.similarList}>
              {similar.map((item) => (
                <li key={item.id}>
                  <Link href={productPageHref(item)}>
                    <span>{brandById[item.brandId]?.name}</span>
                    <strong>{item.name}</strong>
                    <b>{formatNumber(proteinPer100(item))} g / 100 {item.unit}</b>
                    <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <nav className={styles.chips} aria-label="Weiter vergleichen">
          <Link href={`/de/marken/${product.brandId}`}>Alle Produkte von {brandName}</Link>
          <Link href={`/de/kategorien/${product.categoryId}`}>{categoryName} vergleichen</Link>
          <Link href={`/de/produkte/vergleich?product=${product.id}`}>Direkt vergleichen</Link>
          <Link href={knowledgeLink(product)}>Wissen: {knowledgeTitle(product)}</Link>
        </nav>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(product)) }}
      />
    </main>
  );
}

function NutritionRow({ label, per100, portion, strong = false, indent = false }: { label: string; per100: string; portion: string | null; strong?: boolean; indent?: boolean }) {
  return (
    <tr className={strong ? styles.strongRow : undefined}>
      <th scope="row" className={indent ? styles.indent : undefined}>{label}</th>
      <td>{per100}</td>
      {portion !== null && <td>{portion}</td>}
    </tr>
  );
}

function answerText(product: Product, fullName: string, hero: HeroAmount) {
  const per100 = `${formatNumber(proteinPer100(product))} g pro 100 ${product.unit}`;
  if (hero.basis === "per100") {
    const total = packageProtein(product);
    const packagePart = total !== null && product.packageSize ? ` Eine Packung mit ${product.packageSize} ${product.unit} enthält rechnerisch ${formatNumber(total)} g.` : "";
    return `${fullName} hat ${per100} Protein.${packagePart}`;
  }
  return `${fullName} hat ${formatNumber(hero.grams)} g Protein ${hero.label}, das sind ${per100}.`;
}

function similarProducts(product: Product, exclude: Set<string>) {
  const own = proteinPer100(product);
  return categoryPeers(product)
    .filter((item) => item.name !== product.name && !exclude.has(item.id))
    .sort((a, b) => Number(b.brandId === product.brandId) - Number(a.brandId === product.brandId) || Math.abs(proteinPer100(a) - own) - Math.abs(proteinPer100(b) - own))
    .slice(0, 5);
}

const knowledge: Record<string, [string, string]> = {
  "protein-bar": ["/de/wissen/proteinriegel-vergleichen", "Proteinriegel vergleichen"],
  "protein-yogurt": ["/de/wissen/protein-joghurt-skyr-quark", "Joghurt, Skyr und Quark"],
  "skyr-quark": ["/de/wissen/protein-joghurt-skyr-quark", "Joghurt, Skyr und Quark"],
  "protein-powder": ["/de/wissen/proteinpulver-portionsgroesse", "Proteinpulver und Portionsgröße"],
  "plant-protein": ["/de/wissen/pflanzliches-protein-vergleichen", "Pflanzliches Protein"],
};

function knowledgeLink(product: Product) {
  return knowledge[product.categoryId]?.[0] ?? "/de/wissen/protein-pro-100g-verstehen";
}

function knowledgeTitle(product: Product) {
  return knowledge[product.categoryId]?.[1] ?? "Protein pro 100 g verstehen";
}

function breadcrumbJsonLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Startseite", item: `${siteUrl}/de` },
      { "@type": "ListItem", position: 2, name: "Produkte", item: `${siteUrl}/de/produkte` },
      { "@type": "ListItem", position: 3, name: product.name, item: `${siteUrl}/de/produkte/${product.id}` },
    ],
  };
}

function scale(per100: number, size: number) {
  return Math.round(per100 * size) / 100;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 }).format(value);
}

function formatOptional(value: number | null, suffix: string) {
  return value === null ? "–" : `${formatNumber(value)}${suffix}`;
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
