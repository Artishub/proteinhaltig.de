import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductTable } from "@/components/ui/product-table";
import ui from "@/components/ui/ui.module.css";
import { brandById, brands } from "@/lib/data/brands";
import { categoryById } from "@/lib/data/categories";
import { proteinPer100, proteinPer100Kcal } from "@/lib/data/products";
import { brandProducts, groupStats, tableRow } from "@/lib/listing";
import { pageMetadata } from "@/lib/seo";
import { isSearchIndexableBrand } from "@/lib/seo-index";

type PageProps = { params: Promise<{ brandId: string; locale: string }> };

const numberFormat = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 });
const format = (value: number) => numberFormat.format(value);

export function generateStaticParams() {
  return brands.filter((brand) => brandProducts(brand.id).length > 0).map((brand) => ({ brandId: brand.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brandId } = await params;
  const brand = brandById[brandId];
  const stats = groupStats(brandProducts(brandId));
  if (!brand || !stats) return { title: "Marke nicht gefunden", robots: { index: false, follow: true } };
  return {
    ...pageMetadata({
      title: `${brand.name}: Protein in ${stats.count} Produkten`,
      description: `${brand.name} im Vergleich: ${stats.count} Produkte von ${format(proteinPer100(stats.min))} bis ${format(proteinPer100(stats.max))} g Protein pro 100 g, mit Kalorien, Zucker und Quelle.`,
      path: `/de/marken/${brand.id}`,
    }),
    robots: isSearchIndexableBrand(brand.id) ? { index: true, follow: true } : { index: false, follow: true },
  };
}

export default async function BrandPage({ params }: PageProps) {
  const { brandId } = await params;
  const brand = brandById[brandId];
  const items = brandProducts(brandId);
  const stats = groupStats(items);
  if (!brand || !stats) notFound();

  const categoryIds = Array.from(new Set(items.map((item) => item.categoryId)));
  const unit = stats.units.size === 1 ? [...stats.units][0] : "g bzw. ml";

  return (
    <main className={ui.page}>
      <nav aria-label="Brotkrumen" className={ui.breadcrumb}>
        <Link href="/de">Startseite</Link><span aria-hidden="true">/</span>
        <Link href="/de/marken">Marken</Link><span aria-hidden="true">/</span>
        <span aria-current="page">{brand.name}</span>
      </nav>
      <header className={ui.pageHead}>
        <h1>{brand.name}: Protein in {stats.count} Produkten</h1>
        <p className={ui.lead}>
          Am meisten Protein hat {stats.max.name} mit {format(proteinPer100(stats.max))} g pro 100 {stats.max.unit}, am wenigsten {stats.min.name} mit {format(proteinPer100(stats.min))} g.
          {stats.densityMax.id !== stats.max.id ? ` Pro 100 kcal liegt ${stats.densityMax.name} vorn (${format(proteinPer100Kcal(stats.densityMax) ?? 0)} g).` : ""}
        </p>
        <dl className={ui.statGrid}>
          <div className={ui.statCard}><dt>Produkte</dt><dd>{stats.count}</dd></div>
          {categoryIds.length > 1 ? (
            <div className={ui.statCard}><dt>Kategorien</dt><dd>{categoryIds.length}</dd></div>
          ) : (
            <div className={ui.statCard}><dt>Ø Protein</dt><dd>{format(stats.average)} g<small>pro 100 {unit}</small></dd></div>
          )}
          <div className={ui.statCard}><dt>Spanne</dt><dd>{format(proteinPer100(stats.min))}–{format(proteinPer100(stats.max))} g</dd></div>
          <div className={ui.statCard}><dt>Ø pro 100 kcal</dt><dd>{format(stats.densityAverage)} g</dd></div>
        </dl>
      </header>

      <section className={ui.section} aria-labelledby="alle">
        <div className={ui.sectionHead}><h2 id="alle">Alle Produkte von {brand.name}</h2></div>
        <ProductTable rows={items.map((item) => tableRow(item, "brand"))} caption={`Produkte von ${brand.name}, sortierbar`} />
        <nav className={ui.chips} aria-label="Kategorien">
          {categoryIds.map((id) => <Link key={id} href={`/de/kategorien/${id}`}>{categoryById[id]?.name}</Link>)}
          <Link href="/de/marken">Alle Marken</Link>
        </nav>
      </section>
    </main>
  );
}
