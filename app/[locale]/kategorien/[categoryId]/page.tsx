import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductTable } from "@/components/ui/product-table";
import ui from "@/components/ui/ui.module.css";
import { brandById } from "@/lib/data/brands";
import { categories, categoryById } from "@/lib/data/categories";
import { proteinPer100, proteinPer100Kcal } from "@/lib/data/products";
import { categoryProducts, groupStats, tableRow } from "@/lib/listing";
import { fitTitle, pageMetadata } from "@/lib/seo";
import { isSearchIndexableCategory } from "@/lib/seo-index";

type PageProps = { params: Promise<{ categoryId: string; locale: string }> };

const numberFormat = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 });
const format = (value: number) => numberFormat.format(value);

export function generateStaticParams() {
  return categories.filter((category) => categoryProducts(category.id).length > 0).map((category) => ({ categoryId: category.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categoryId } = await params;
  const category = categoryById[categoryId];
  const stats = groupStats(categoryProducts(categoryId));
  if (!category || !stats) return { title: "Kategorie nicht gefunden", robots: { index: false, follow: true } };
  return {
    ...pageMetadata({
      title: `${category.name}: Protein im Vergleich`,
      absoluteTitle: fitTitle(`${category.name}: Protein im Vergleich`),
      description: `${stats.count} ${category.name}-Produkte nach Protein pro 100 g, pro Portion und pro 100 kcal. Durchschnitt ${format(stats.average)} g, mit Quelle und Prüfdatum.`,
      path: `/de/kategorien/${category.id}`,
    }),
    robots: isSearchIndexableCategory(category.id) ? { index: true, follow: true } : { index: false, follow: true },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { categoryId } = await params;
  const category = categoryById[categoryId];
  const items = categoryProducts(categoryId);
  const stats = groupStats(items);
  if (!category || !stats) notFound();

  const unit = stats.units.size === 1 ? [...stats.units][0] : "g bzw. ml";
  const brandIds = Array.from(new Set(items.map((item) => item.brandId))).sort((a, b) => (brandById[a]?.name ?? "").localeCompare(brandById[b]?.name ?? "", "de"));
  const fullName = (id: string) => {
    const product = items.find((item) => item.id === id)!;
    return `${brandById[product.brandId]?.name ?? ""} ${product.name}`.trim();
  };

  return (
    <main className={ui.page}>
      <nav aria-label="Brotkrumen" className={ui.breadcrumb}>
        <Link href="/de">Startseite</Link><span aria-hidden="true">/</span>
        <Link href="/de/kategorien">Kategorien</Link><span aria-hidden="true">/</span>
        <span aria-current="page">{category.name}</span>
      </nav>
      <header className={ui.pageHead}>
        <h1>{category.name}: Protein im Vergleich</h1>
        <p className={ui.lead}>
          {stats.count} Produkte von {brandIds.length} Marken. Im Schnitt {format(stats.average)} g Protein pro 100 {unit}; am meisten hat {fullName(stats.max.id)} mit {format(proteinPer100(stats.max))} g.
          {stats.densityMax.id !== stats.max.id ? ` Pro 100 kcal liegt ${fullName(stats.densityMax.id)} vorn (${format(proteinPer100Kcal(stats.densityMax) ?? 0)} g).` : ""}
        </p>
        <dl className={ui.statGrid}>
          <div className={ui.statCard}><dt>Produkte</dt><dd>{stats.count}</dd></div>
          <div className={ui.statCard}><dt>Ø Protein</dt><dd>{format(stats.average)} g<small>pro 100 {unit}</small></dd></div>
          <div className={ui.statCard}><dt>Spanne</dt><dd>{format(proteinPer100(stats.min))}–{format(proteinPer100(stats.max))} g</dd></div>
          <div className={ui.statCard}><dt>Ø pro 100 kcal</dt><dd>{format(stats.densityAverage)} g</dd></div>
        </dl>
      </header>

      <section className={ui.section} aria-labelledby="alle">
        <div className={ui.sectionHead}><h2 id="alle">Alle {category.name}-Produkte</h2></div>
        <ProductTable rows={items.map((item) => tableRow(item, "category"))} caption={`${category.name}, sortierbar`} />
        <nav className={ui.chips} aria-label="Marken">
          {brandIds.map((id) => <Link key={id} href={`/de/marken/${id}`}>{brandById[id]?.name}</Link>)}
        </nav>
      </section>
    </main>
  );
}
