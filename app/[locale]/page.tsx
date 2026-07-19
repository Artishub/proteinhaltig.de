import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight, Search } from "lucide-react";
import { articleBySlug, homepageArticleSlugs, type Article } from "@/lib/content/articles";
import { homeContent } from "@/lib/content/home";
import { drinks, proteinPer100Value, proteinPortions, totalProteinGrams, type Drink } from "@/lib/data/drinks";
import { brandById } from "@/lib/data/brands";
import { categoryById } from "@/lib/data/categories";
import { pageMetadata } from "@/lib/seo";
import styles from "./home.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Proteinprodukte vergleichen",
  description: "Vergleiche Proteinprodukte nach Protein pro 100 g/ml, pro Packung und pro Portion.",
  path: "/de",
});

const featuredProductIds = [
  "ehrmann-high-protein-pudding-schoko-200",
  "barebells-protein-bar-caramel-cashew-55",
  "alpro-high-protein-soja-schoko-250",
  "milbona-high-protein-skyr-natur-500",
];

export default function HomePage() {
  const selected = featuredProductIds.map(findProduct);
  const heroProduct = selected[0];
  const featuredArticles = homepageArticleSlugs.map(findArticle);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>Protein-Check für den Alltag</p>
            <h1>{homeContent.title}</h1>
            <p className={styles.lede}>Proteinprodukte, lesbar gemacht. Vergleiche Werte pro 100 g/ml, pro Packung und als 10-g-Portion.</p>
            <div className={styles.heroActions}>
              <Link href="/de/produkte" className={styles.primaryButton}>Produkt finden <ArrowRight size={17} strokeWidth={1.75} aria-hidden="true" /></Link>
              <a href="#proteinvergleich" className={styles.textButton}>So liest du die Werte <ChevronRight size={17} strokeWidth={1.75} aria-hidden="true" /></a>
            </div>
          </div>

          <article className={styles.heroCard} aria-label={`${heroProduct.name}: Protein pro Packung`}>
            <div className={styles.cardTopline}>
              <span>Produkt im Blick</span>
              <span>{sizeLabel(heroProduct)}</span>
            </div>
            <div className={styles.heroCardContent}>
              <p className={styles.brand}>{brandById[heroProduct.brandId]?.name}</p>
              <h2>{heroProduct.name}</h2>
              <div className={styles.proteinNumber}>
                <strong>{formatNumber(totalProteinGrams(heroProduct))}</strong><span>g Protein</span>
              </div>
              <p className={styles.cardHint}>pro Packung · {formatNumber(proteinPortions(heroProduct))} Portionen à 10 g</p>
              <div className={styles.blockField} aria-hidden="true">
                {Array.from({ length: proteinBlockCount(heroProduct) }).map((_, index) => <i key={index} />)}
              </div>
            </div>
            <Link href={`/de/produkte/${heroProduct.id}`} className={styles.cardLink}>Detail ansehen <ArrowRight size={17} strokeWidth={1.75} aria-hidden="true" /></Link>
          </article>
        </div>
      </section>

      <nav className={styles.quickNav} aria-label="Schnelleinstieg">
        <Link href="/de/produkte"><span>Produkte</span><ArrowRight size={17} strokeWidth={1.75} aria-hidden="true" /></Link>
        <Link href="/de/produkte/vergleich"><span>Vergleichen</span><ArrowRight size={17} strokeWidth={1.75} aria-hidden="true" /></Link>
        <Link href="/de/kategorien"><span>Kategorien</span><ArrowRight size={17} strokeWidth={1.75} aria-hidden="true" /></Link>
        <Link href="/de/wissen"><span>Wissen</span><ArrowRight size={17} strokeWidth={1.75} aria-hidden="true" /></Link>
      </nav>

      <section className={styles.snapshot} id="proteinvergleich">
        <div className={styles.sectionIntro}>
          <h2>Vier Proteinprodukte.<br />Direkt vergleichbar.</h2>
          <p>Der Wert pro 100 g/ml schafft eine gemeinsame Basis. Die Packungsgröße zeigt, wie viel Protein tatsächlich enthalten ist.</p>
        </div>
        <div className={styles.productGrid}>
          {selected.map((drink) => <ProductCard drink={drink} key={drink.id} />)}
        </div>
      </section>

      <section className={styles.knowledge} aria-labelledby="knowledge-title">
        <div className={styles.knowledgeHeader}>
          <h2 id="knowledge-title">Proteinwerte besser einordnen.</h2>
          <Link href="/de/wissen" className={styles.textButton}>
            Alle Artikel <ArrowRight size={17} strokeWidth={1.75} aria-hidden="true" />
          </Link>
        </div>
        <div className={styles.knowledgeGrid}>
          <KnowledgeTeaser article={featuredArticles[0]} />
          <div className={styles.knowledgeStack}>
            {featuredArticles.slice(1).map((article) => <KnowledgeTeaser key={article.slug} article={article} />)}
          </div>
        </div>
      </section>

      <section className={styles.explorer}>
        <div>
          <p className={styles.explorerLabel}><Search size={14} strokeWidth={1.75} aria-hidden="true" /> Durchsuche unsere Produktdatenbank</p>
          <h2>Vergleiche nicht nur den Claim.<br />Schau auf die Packung.</h2>
        </div>
        <div className={styles.explorerPanel}>
          <p>Filtere nach Marke, Kategorie, Packung oder Proteinwert. Jede Detailseite nennt die hinterlegte Quelle und den Prüfstatus.</p>
          <Link href="/de/produkte" className={styles.lightButton}>Alle Produkte <ArrowRight size={17} strokeWidth={1.75} aria-hidden="true" /></Link>
        </div>
      </section>

      <section className={styles.method}>
        <div className={styles.methodTitle}>
          <h2>So rechnet Proteinhaltig.</h2>
        </div>
        <div className={styles.methodSteps}>
          {homeContent.guide.map((item) => <article key={item.title}><h3>{item.title}</h3><p>{item.text}</p></article>)}
        </div>
      </section>

      <section className={styles.closing}>
        <div>
          <h2>Dein Produkt im Vergleich.</h2>
          <p>Werte vergleichen, Quelle prüfen, passend einordnen.</p>
        </div>
        <Link href="/de/produkte/vergleich" className={styles.primaryButton}>Jetzt vergleichen <ArrowRight size={17} strokeWidth={1.75} aria-hidden="true" /></Link>
      </section>
    </main>
  );
}

function KnowledgeTeaser({ article }: { article: Article }) {
  return (
    <Link href={`/de/wissen/${article.slug}`} className={styles.knowledgeTeaser}>
      {article.image && (
        <div className={styles.knowledgeTeaserImage}>
          <Image
            src={article.image.src}
            alt=""
            width={article.image.width}
            height={article.image.height}
            sizes="(max-width: 767px) calc(100vw - 2.5rem), 280px"
          />
        </div>
      )}
      <div className={styles.knowledgeTeaserBody}>
        <p className={styles.knowledgeMeta}>{article.minutes} Min. Lesezeit</p>
        <h3>{article.title}</h3>
        <p className={styles.knowledgeDescription}>{article.description}</p>
        <span>Lesen <ArrowRight size={17} strokeWidth={1.75} aria-hidden="true" /></span>
      </div>
    </Link>
  );
}

function ProductCard({ drink }: { drink: Drink }) {
  const brandName = brandById[drink.brandId]?.name ?? "Marke";

  return (
    <Link href={`/de/produkte/${drink.id}`} className={styles.productCard}>
      <div className={styles.productCardTop}><span className={styles.productChip}>{categoryById[drink.categoryId]?.name}</span><span>{sizeLabel(drink)}</span></div>
      <div>
        <p className={styles.brand}>{brandName}</p>
        <h3>{drink.name}</h3>
      </div>
      <div className={styles.measure}><strong>{formatNumber(totalProteinGrams(drink))} g</strong><span>Protein pro Packung</span></div>
      <div className={styles.cardFoot}><span>{formatNumber(proteinPer100Value(drink))} g / 100 g/ml</span><span>{formatNumber(proteinPortions(drink))} Portionen</span></div>
    </Link>
  );
}

function findProduct(id: string) {
  const drink = drinks.find((item) => item.id === id);
  if (!drink) throw new Error(`Produkt ${id} fehlt.`);
  return drink;
}

function findArticle(slug: string) {
  const article = articleBySlug[slug];
  if (!article) throw new Error(`Artikel ${slug} fehlt.`);
  return article;
}

function sizeLabel(drink: { sizeMl: number | null; packageUnit?: string | null }) {
  return drink.sizeMl ? `${drink.sizeMl} ${drink.packageUnit ?? "g"}` : "/";
}

function formatNumber(value: number | null) {
  return value === null ? "/" : new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 }).format(value);
}

function proteinBlockCount(drink: Drink) {
  return Math.min(Math.max(Math.round(proteinPortions(drink) ?? 0), 1), 18);
}
