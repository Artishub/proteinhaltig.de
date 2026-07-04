import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calculator, ListFilter } from "lucide-react";
import { homeContent } from "@/lib/content/home";
import { articles } from "@/lib/content/articles";
import { drinks, groupedDrinkFamilies, totalSugarGrams } from "@/lib/data/drinks";
import { brandById } from "@/lib/data/brands";
import { categories, categoryById } from "@/lib/data/categories";

export const metadata: Metadata = {
  title: "Proteinprodukte vergleichen: Riegel, Joghurt, Skyr, Drinks",
  description: "Vergleiche Proteinprodukte nach Protein pro 100 g/ml, pro Packung und pro Portion.",
  alternates: { canonical: "/de" },
};

export default function HomePage() {
  const highest = groupedDrinkFamilies(drinks).sort((a, b) => (highestPer100(b) ?? -1) - (highestPer100(a) ?? -1)).slice(0, 4);
  const popularProducts = drinks.slice(0, 6);
  const categoryLinks = categories.slice(0, 5);
  const featuredArticles = articles.slice(0, 4);

  return (
    <main>
      <section className="page-grid border-b border-ash">
        <div className="mx-auto grid max-w-page gap-10 px-4 py-16 md:grid-cols-[1.15fr_0.85fr] md:py-24">
          <div>
            <p className="mb-4 text-sm font-medium text-slate">{homeContent.eyebrow}</p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">{homeContent.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate">{homeContent.intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/de/produkte" className="focus-ring inline-flex h-11 items-center gap-2 rounded-md border border-ink bg-ink px-4 text-sm font-medium text-white dark:text-black">
                Produkte ansehen <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          <div className="self-end border border-ash bg-paper">
            <div className="flex items-center justify-between border-b border-ash px-4 py-3">
              <span className="text-sm font-medium">Viel Protein pro 100 g/ml</span>
              <ListFilter size={16} />
            </div>
            <div className="divide-y divide-ash">
              {highest.map((item) => {
                const drink = item.type === "drink" ? item.drink : item.representative;
                const brandName = brandById[drink.brandId]?.name ?? "";
                const categoryName = categoryById[drink.categoryId]?.name ?? "";
                const title = item.type === "group" ? `${brandName} - Mehrere` : drink.name;
                const subtitle = item.type === "group" ? `${categoryName} · ${item.drinks.length} Produkte` : `${brandName} · ${categoryName} · ${sizeLabel(drink)}`;
                const href = item.type === "group" ? `/de/produkte?brand=${drink.brandId}&category=${drink.categoryId}` : `/de/produkte/${drink.id}`;

                return (
                  <Link key={item.id} href={href} className="grid grid-cols-[1fr_auto] gap-3 px-4 py-4 hover:bg-mist">
                    <div>
                      <p className="font-medium">{title}</p>
                      <p className="mt-1 text-sm text-slate">{subtitle}</p>
                    </div>
                    <strong className="tabular-nums">{formatOptionalGrams(highestPer100(item))}</strong>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-page px-4 py-10">
        <div className="grid overflow-hidden rounded-lg border border-ash md:grid-cols-3">
          {homeContent.guide.map((item, index) => (
            <div key={item.title} className="border-b border-ash p-5 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
              <p className="text-xs font-medium uppercase tracking-wide text-slate">0{index + 1}</p>
              <h2 className="mt-4 text-lg font-semibold tracking-tight">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate">{item.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-slate">Hinweis: Die MVP-Daten sind Beispieldaten. Prüfe vor Veröffentlichung die aktuelle Verpackung.</p>
      </section>

      <section className="mx-auto max-w-page px-4 py-10">
        <div className="grid gap-8 md:grid-cols-[0.75fr_1.25fr]">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Beliebte Vergleiche</h2>
            <p className="mt-3 leading-7 text-slate">Proteinriegel, Pudding, Skyr, Drinks und Pulver direkt öffnen.</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {popularProducts.map((drink) => {
              const brandName = brandById[drink.brandId]?.name ?? "";
              return (
                <Link key={drink.id} href={`/de/produkte/${drink.id}`} className="rounded-lg border border-ash bg-paper p-4 hover:border-marigold">
                  <p className="font-semibold">{drink.name}</p>
                  <p className="mt-1 text-sm text-slate">{brandName} · {sizeLabel(drink)} · {formatOptionalGrams(totalSugarGrams(drink))}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-ash bg-mist">
        <div className="mx-auto max-w-page px-4 py-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold tracking-tight">Nach Kategorie entdecken</h2>
            <Link href="/de/kategorien" className="focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-ash bg-paper px-4 text-sm font-medium hover:border-marigold">
              Alle Kategorien anzeigen <ArrowRight size={16} />
            </Link>
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {categoryLinks.map((category) => (
              <Link key={category.id} href={`/de/produkte?category=${category.id}`} className="rounded-lg border border-ash bg-paper p-4 hover:border-marigold">
                <p className="font-semibold">{category.name}</p>
                <p className="mt-2 text-sm leading-6 text-slate">{category.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-page px-4 py-10">
        <div className="grid gap-8 md:grid-cols-[0.75fr_1.25fr]">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Protein verstehen</h2>
            <p className="mt-3 leading-7 text-slate">Kurze Texte zu 100-g-Werten, Packungsgrößen, Proteinriegeln, Skyr und Pulver-Portionen.</p>
            <Link href="/de/wissen" className="focus-ring mt-5 inline-flex h-10 items-center gap-2 rounded-md border border-ash bg-paper px-4 text-sm font-medium hover:border-marigold">
              Weitere Artikel <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid gap-2">
            {featuredArticles.map((article) => (
              <Link key={article.slug} href={`/de/wissen/${article.slug}`} className="grid gap-3 rounded-lg border border-ash bg-paper p-4 hover:border-marigold sm:grid-cols-[1fr_auto]">
                <div>
                  <p className="font-semibold">{article.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate">{article.description}</p>
                </div>
                <span className="text-sm text-slate">{article.minutes} Min.</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-ash bg-mist">
        <div className="mx-auto grid max-w-page gap-8 px-4 py-12 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Calculator size={20} />
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">Rechnen statt schätzen.</h2>
          </div>
          <p className="text-lg leading-8 text-slate">
            Die Datenbank nutzt Nährwertangaben und rechnet daraus Protein pro Packung und Proteinportionen. So wird der Unterschied zwischen 55-g-Riegel, 200-g-Becher und 30-g-Pulverportion sichtbar.
          </p>
        </div>
      </section>
    </main>
  );
}

function highestPer100(item: ReturnType<typeof groupedDrinkFamilies>[number]) {
  if (item.type === "drink") return item.drink.sugarPer100Ml;
  const values = item.drinks.map((drink) => drink.sugarPer100Ml).filter((value): value is number => value !== null);
  return values.length ? Math.max(...values) : null;
}

function sizeLabel(drink: { sizeMl: number | null; packageUnit?: string }) {
  return drink.sizeMl ? `${drink.sizeMl} ${drink.packageUnit ?? "g"}` : "/";
}

function formatOptionalGrams(value: number | null) {
  return value === null ? "/" : `${new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 }).format(value)} g Protein`;
}
