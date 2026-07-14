import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronRight, CircleHelp, Scale, Sparkles } from "lucide-react";
import { homeContent } from "@/lib/content/home";
import { drinks, sugarCubes, totalSugarGrams, type Drink } from "@/lib/data/drinks";
import { brandById } from "@/lib/data/brands";
import { categoryById } from "@/lib/data/categories";
import { pageMetadata } from "@/lib/seo";
import styles from "./home.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Proteinprodukte vergleichen",
  description: "Vergleiche Proteinprodukte nach Protein pro 100 g/ml, pro Packung und pro Portion.",
  path: "/de",
});

export default function HomePage() {
  const selected = featuredProducts();
  const heroProduct = selected[0] ?? drinks[0];

  if (!heroProduct) return null;

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}><Sparkles size={14} aria-hidden="true" /> {homeContent.eyebrow}</p>
            <h1>{homeContent.title}</h1>
            <p className={styles.lede}>{homeContent.intro}</p>
            <div className={styles.heroActions}>
              <Link href="/de/produkte" className={styles.primaryButton}>Produkt finden <ArrowRight size={17} /></Link>
              <a href="#proteinvergleich" className={styles.textButton}>So liest du die Werte <ChevronRight size={17} /></a>
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
                <strong>{formatNumber(totalSugarGrams(heroProduct))}</strong><span>g Protein</span>
              </div>
              <p className={styles.cardHint}>pro Packung, {formatNumber(sugarCubes(heroProduct))} Portionen à 10 g</p>
              <div className={styles.blockField} aria-hidden="true">
                {Array.from({ length: proteinBlockCount(heroProduct) }).map((_, index) => <i key={index} />)}
              </div>
            </div>
            <Link href={`/de/produkte/${heroProduct.id}`} className={styles.cardLink}>Detail ansehen <ArrowRight size={16} /></Link>
          </article>
        </div>
      </section>

      <nav className={styles.quickNav} aria-label="Schnelleinstieg">
        <Link href="/de/produkte"><span>Produkte</span><ArrowRight size={18} /></Link>
        <Link href="/de/kategorien"><span>Kategorien</span><ArrowRight size={18} /></Link>
        <Link href="/de/marken"><span>Marken</span><ArrowRight size={18} /></Link>
        <Link href="/de/wissen"><span>Wissen</span><ArrowRight size={18} /></Link>
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

      <section className={styles.explorer}>
        <div>
          <h2>Nach Produkt suchen.<br />Werte prüfen.</h2>
        </div>
        <div className={styles.explorerPanel}>
          <p>Filtere nach Marke, Kategorie, Packung oder Proteinwert. Jede Detailseite nennt die hinterlegte Quelle und den Prüfstatus.</p>
          <Link href="/de/produkte" className={styles.lightButton}>Alle Produkte <ArrowRight size={17} /></Link>
        </div>
      </section>

      <section className={styles.method}>
        <div className={styles.methodTitle}>
          <p className={styles.kicker}><CircleHelp size={14} aria-hidden="true" /> Klare Berechnung</p>
          <h2>So rechnet Proteinhaltig.</h2>
        </div>
        <div className={styles.methodSteps}>
          {homeContent.guide.map((item) => <article key={item.title}><h3>{item.title}</h3><p>{item.text}</p></article>)}
        </div>
      </section>

      <section className={styles.closing}>
        <Scale size={25} aria-hidden="true" />
        <div>
          <h2>Dein Produkt im Vergleich.</h2>
          <p>Werte vergleichen, Quelle prüfen, passend einordnen.</p>
        </div>
        <Link href="/de/produkte" className={styles.primaryButton}>Jetzt vergleichen <ArrowRight size={17} /></Link>
      </section>
    </main>
  );
}

function ProductCard({ drink }: { drink: Drink }) {
  const brandName = brandById[drink.brandId]?.name ?? "Marke";

  return (
    <Link href={`/de/produkte/${drink.id}`} className={styles.productCard}>
      <div className={styles.productCardTop}><span>{categoryById[drink.categoryId]?.name}</span><span>{sizeLabel(drink)}</span></div>
      <div>
        <p className={styles.brand}>{brandName}</p>
        <h3>{drink.name}</h3>
      </div>
      <div className={styles.measure}><strong>{formatNumber(totalSugarGrams(drink))} g</strong><span>Protein pro Packung</span></div>
      <div className={styles.cardFoot}><span>{formatNumber(drink.sugarPer100Ml)} g / 100 g/ml</span><span>{formatNumber(sugarCubes(drink))} Portionen</span></div>
    </Link>
  );
}

function featuredProducts() {
  const maxSizeByCategory: Record<string, number> = {
    "protein-bar": 100,
    "protein-yogurt": 500,
    "protein-pudding": 500,
    "protein-drink": 500,
    "skyr-quark": 500,
    "protein-snack": 200,
  };
  const seenCategories = new Set<string>();
  const selected: Drink[] = [];
  const candidates = drinks
    .filter((drink) => {
      const maxSize = maxSizeByCategory[drink.categoryId];
      return maxSize && drink.sizeMl && drink.sizeMl <= maxSize && drink.sugarPer100Ml !== null && drink.sugarPer100Ml <= 35;
    })
    .sort((a, b) => (totalSugarGrams(b) ?? 0) - (totalSugarGrams(a) ?? 0));

  for (const drink of candidates) {
    if (seenCategories.has(drink.categoryId)) continue;
    selected.push(drink);
    seenCategories.add(drink.categoryId);
    if (selected.length === 4) break;
  }

  return selected;
}

function sizeLabel(drink: { sizeMl: number | null; packageUnit?: string | null }) {
  return drink.sizeMl ? `${drink.sizeMl} ${drink.packageUnit ?? "g"}` : "/";
}

function formatNumber(value: number | null) {
  return value === null ? "/" : new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 }).format(value);
}

function proteinBlockCount(drink: Drink) {
  return Math.min(Math.max(Math.round(sugarCubes(drink) ?? 0), 1), 18);
}
