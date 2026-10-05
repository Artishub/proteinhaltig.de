import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EnergySplit } from "@/components/ui/energy-split";
import { HomeSearch } from "@/components/ui/home-search";
import { ProteinScatter } from "@/components/ui/protein-scatter";
import ui from "@/components/ui/ui.module.css";
import { articleBySlug, homepageArticleSlugs } from "@/lib/content/articles";
import { brandById } from "@/lib/data/brands";
import { categories, categoryById } from "@/lib/data/categories";
import { proteinPer100, proteinPer100Kcal, type Product } from "@/lib/data/products";
import { categoryRows, formulaExample, productsByDemand, showcaseProduct, siteStats } from "@/lib/home-data";
import { productPageHref } from "@/lib/page-routing";
import { heroAmount } from "@/lib/product-hero";
import { pageSummaries } from "@/lib/product-summary";
import { highProteinMinShare, proteinReferenceIntakeGrams, proteinSourceMinShare, referenceIntakeShare } from "@/lib/protein-context";

export const metadata: Metadata = {
  title: "Redesign-Entwurf",
  robots: { index: false, follow: false },
};

export const revalidate = 86400;

const numberFormat = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 });
const format = (value: number) => numberFormat.format(value);

export default function RedesignPage() {
  const summaries = pageSummaries();
  const stats = siteStats();
  const showcase = showcaseProduct();
  const popular = productsByDemand(7).filter((product) => product.id !== showcase.id).slice(0, 6);
  const rows = categoryRows();
  const maxRange = Math.max(...rows.map((row) => row.max));
  const example = formulaExample();
  const exampleHero = heroAmount(example);
  const articles = homepageArticleSlugs.map((slug) => articleBySlug[slug]).filter(Boolean).slice(0, 3);

  return (
    <main className={`theme-protein ${ui.page}`}>
      <section className={ui.hero}>
        <div className={ui.heroCopy}>
          <h1>Wie viel Protein steckt drin?</h1>
          <p className={ui.lead}>
            {stats.productCount} Proteinprodukte von {stats.brandCount} Marken mit Protein pro Portion, pro 100 g und pro 100 kcal. Jeder Wert mit Quelle und Prüfdatum.
          </p>
          <HomeSearch items={summaries} />
          <p className={ui.metaLine}>
            Riegel, Pulver, Drinks, Skyr und Pudding · zuletzt geprüft am {new Intl.DateTimeFormat("de-DE").format(new Date(stats.latestCheck))} · <Link href="/de/produkte">alle Produkte</Link>
          </p>
        </div>
        <Showcase product={showcase} />
      </section>

      <section className={ui.section} aria-labelledby="meistgesucht">
        <div className={ui.sectionHead}>
          <h2 id="meistgesucht">Meistgesucht</h2>
          <Link href="/de/produkte" className={ui.textLink}>Alle Produkte <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
        <div className={ui.popularGrid}>
          {popular.map((product) => <PopularCard key={product.id} product={product} />)}
        </div>
      </section>

      <section className={ui.section} aria-labelledby="ueberblick">
        <div className={ui.sectionHead}>
          <div>
            <h2 id="ueberblick">Protein und Kalorien im Überblick</h2>
            <p className={ui.sectionLead}>
              Jeder Punkt ist ein Produkt, pro 100 g bzw. 100 ml. Je weiter oben links, desto mehr Protein pro Kalorie. Oberhalb der Linie stammen mindestens 20 % der Energie aus Protein, das ist die EU-Grenze für „hoher Proteingehalt“.
            </p>
          </div>
        </div>
        <div className={ui.stage}>
          <ProteinScatter
            items={summaries}
            categories={categories.map((category) => ({ id: category.id, name: category.name }))}
            sourceShare={proteinSourceMinShare}
            highShare={highProteinMinShare}
          />
        </div>
      </section>

      <section className={ui.section} aria-labelledby="kategorien">
        <div className={ui.sectionHead}>
          <h2 id="kategorien">Kategorien im Vergleich</h2>
        </div>
        <div className={ui.tableCard}>
          <table className={ui.table}>
            <thead>
              <tr>
                <th scope="col">Kategorie</th>
                <th scope="col">Produkte</th>
                <th scope="col">Ø Protein</th>
                <th scope="col" className={ui.hideMobile}>Spanne</th>
                <th scope="col">Ø pro 100 kcal</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <th scope="row"><Link href={`/de/produkte?category=${row.id}`}>{row.name}</Link></th>
                  <td>{row.count}</td>
                  <td>{format(row.average)} g <small>/ {row.unit}</small></td>
                  <td className={ui.hideMobile}>
                    <span className={ui.range} aria-label={`${format(row.min)} bis ${format(row.max)} g`}>
                      <i style={{ left: `${(row.min / maxRange) * 100}%`, width: `${Math.max(((row.max - row.min) / maxRange) * 100, 1.5)}%` }} />
                    </span>
                    <small>{format(row.min)}–{format(row.max)} g</small>
                  </td>
                  <td>{format(row.density)} g</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={ui.section} aria-labelledby="rechenweg">
        <div className={ui.sectionHead}>
          <h2 id="rechenweg">So rechnen wir</h2>
        </div>
        <div className={ui.formula}>
          <p className={ui.formulaProduct}>{brandById[example.brandId]?.name} {example.name}</p>
          <ol className={ui.formulaSteps}>
            <li><strong>{format(proteinPer100(example))} g</strong><span>Protein pro 100 g laut Hersteller</span></li>
            <li aria-hidden="true">×</li>
            <li><strong>{exampleHero.size} g</strong><span>Riegelgewicht</span></li>
            <li aria-hidden="true">÷ 100 =</li>
            <li className={ui.formulaResult}><strong>{format(exampleHero.grams)} g</strong><span>Protein pro Riegel</span></li>
            <li aria-hidden="true">=</li>
            <li><strong>{referenceIntakeShare(exampleHero.grams)} %</strong><span>der Referenzmenge von {proteinReferenceIntakeGrams} g</span></li>
          </ol>
          <p className={ui.formulaNote}>
            Die Referenzmenge von {proteinReferenceIntakeGrams} g Eiweiß pro Tag stammt aus der EU-Lebensmittelinformationsverordnung (1169/2011, Anhang XIII). Protein pro 100 kcal: {format(proteinPer100Kcal(example) ?? 0)} g.
          </p>
        </div>
      </section>

      {articles.length > 0 && (
        <section className={ui.section} aria-labelledby="wissen">
          <div className={ui.sectionHead}>
            <h2 id="wissen">Grundlagen</h2>
            <Link href="/de/wissen" className={ui.textLink}>Alle Artikel <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
          <div className={ui.articleGrid}>
            {articles.map((article) => (
              <Link key={article.slug} href={`/de/wissen/${article.slug}`} className={ui.articleCard}>
                {article.image && <Image src={article.image.src} alt="" width={article.image.width} height={article.image.height} sizes="(max-width: 860px) 100vw, 33vw" />}
                <span>{article.minutes} Min.</span>
                <h3>{article.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function Showcase({ product }: { product: Product }) {
  const hero = heroAmount(product);
  const category = categoryById[product.categoryId]?.name ?? "";
  return (
    <article className={ui.showcase} aria-labelledby="heute">
      <p className={ui.showcaseKicker} id="heute">Heute im Blick · {category}</p>
      <h2 className={ui.showcaseName}>
        <Link href={productPageHref(product)}>{brandById[product.brandId]?.name} {product.name}</Link>
      </h2>
      <p className={`${ui.showcaseNumber} display`}><strong>{format(hero.grams)}</strong><span>g Protein {hero.label}</span></p>
      <dl className={ui.showcaseStats}>
        <div><dt>pro 100 {product.unit}</dt><dd>{format(proteinPer100(product))} g</dd></div>
        <div><dt>pro 100 kcal</dt><dd>{format(proteinPer100Kcal(product) ?? 0)} g</dd></div>
        <div><dt>kcal pro 100 {product.unit}</dt><dd>{Math.round(product.nutritionPer100.energyKcal)}</dd></div>
      </dl>
      <EnergySplit nutrition={product.nutritionPer100} onStage />
    </article>
  );
}

function PopularCard({ product }: { product: Product }) {
  const hero = heroAmount(product);
  const share = hero.basis === "per100" ? null : referenceIntakeShare(hero.grams);
  return (
    <Link href={productPageHref(product)} className={ui.popularCard}>
      <span className={ui.popularCategory}>{categoryById[product.categoryId]?.name}</span>
      <span className={ui.popularName}>{brandById[product.brandId]?.name} {product.name}</span>
      <span className={`${ui.popularValue} display`}><strong>{format(hero.grams)} g</strong> {hero.label}</span>
      {share !== null && <span className={ui.popularBar} aria-hidden="true"><i style={{ width: `${Math.min(share, 100)}%` }} /></span>}
      <span className={ui.popularFoot}>
        {share !== null ? `${share} % von ${proteinReferenceIntakeGrams} g` : `${format(proteinPer100Kcal(product) ?? 0)} g pro 100 kcal`}
      </span>
    </Link>
  );
}
