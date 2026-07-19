import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { articles, type Article } from "@/lib/content/articles";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Proteinprodukte verstehen",
  description: "Protein in Riegeln, Joghurt, Skyr, Drinks und Pulver nach 100 g/ml, Packung und Portion einordnen.",
  path: "/de/wissen",
});

export default function KnowledgePage() {
  const featuredArticles = articles.filter((article) => article.image);
  const remainingArticles = articles.filter((article) => !article.image);

  return (
    <main className="mx-auto max-w-page px-4 py-10">
      <h1 className="text-4xl font-semibold tracking-[-0.02em]">Proteinprodukte verstehen</h1>
      <div className="mt-6 grid gap-8 border-y border-ash py-8 md:grid-cols-[0.9fr_1.1fr]">
        <p className="text-2xl font-medium leading-9 tracking-[-0.02em]">
          Proteinclaims wirken ähnlich. Die Nährwerttabelle zeigt, ob Riegel, Joghurt, Skyr, Drink oder Pulver wirklich vergleichbar sind.
        </p>
        <div className="space-y-4 leading-7 text-slate">
          <p>Proteinhaltig.de trennt Protein pro 100 g/ml vom Protein pro Packung. Genau dort werden Portionsgrößen sichtbar.</p>
          <p>Ein einzelner Wert entscheidet nicht über Qualität. Kalorien, Zucker, Fett, Zutaten und der eigene Alltag gehören ebenfalls dazu.</p>
          <p>Die Artikel erklären die Rechnungen hinter der Produktsuche kurz und praktisch.</p>
        </div>
      </div>

      <section className="mt-10" aria-labelledby="featured-knowledge-title">
        <h2 id="featured-knowledge-title" className="sr-only">Ausgewählte Wissensartikel</h2>
        <div className="space-y-3">
          {featuredArticles.map((article) => <ProminentArticle key={article.slug} article={article} />)}
        </div>
      </section>

      <section className="mt-10 rounded-lg border border-ash bg-mist p-5">
        <h2 className="text-2xl font-medium tracking-[-0.02em]">Häufig gesucht</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { href: "/de/wissen/protein-pro-100g-verstehen", label: "Protein pro 100 g" },
            { href: "/de/wissen/proteinriegel-vergleichen", label: "Proteinriegel vergleichen" },
            { href: "/de/wissen/protein-joghurt-skyr-quark", label: "Skyr und Protein-Joghurt" },
            { href: "/de/wissen/proteinpulver-portionsgroesse", label: "Proteinpulver Portion" },
            { href: "/de/produkte?category=protein-bar", label: "Proteinriegel öffnen" },
            { href: "/de/produkte?category=protein-pudding", label: "Protein-Pudding öffnen" },
          ].map((item) => (
            <Link key={item.label} href={item.href} className="focus-ring rounded-md bg-paper px-3 py-2 text-sm hover:bg-cream">
              {item.label}
            </Link>
          ))}
        </div>
      </section>
      <h2 className="mt-12 text-2xl font-medium tracking-[-0.02em]">Weitere Artikel</h2>
      <div className="mt-4 grid gap-x-8 md:grid-cols-2">
        {remainingArticles.map((article) => (
          <Link key={article.slug} href={`/de/wissen/${article.slug}`} className="focus-ring grid gap-4 border-t border-ash py-5 hover:bg-mist md:grid-cols-[1fr_auto] md:px-3">
            <div>
              <h3 className="text-xl font-medium tracking-[-0.02em]">{article.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate">{article.description}</p>
            </div>
            <span className="inline-flex items-center gap-2 text-sm text-slate">
              {article.minutes} Min. <ArrowRight size={17} strokeWidth={1.75} aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}

function ProminentArticle({ article }: { article: Article }) {
  return (
    <Link
      href={`/de/wissen/${article.slug}`}
      className="focus-ring group grid overflow-hidden rounded-lg border border-ash bg-mist hover:border-marigold sm:grid-cols-[17.5rem_1fr]"
    >
      {article.image && (
        <div className="aspect-[3/2] overflow-hidden bg-ink sm:aspect-auto">
          <Image
            src={article.image.src}
            alt=""
            width={article.image.width}
            height={article.image.height}
            sizes="(max-width: 639px) calc(100vw - 2rem), 280px"
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="flex min-w-0 flex-col p-5">
        <p className="text-sm text-slate">{article.minutes} Min. Lesezeit</p>
        <h2 className="mt-2 text-2xl font-medium tracking-[-0.02em]">{article.title}</h2>
        <p className="mt-3 text-sm leading-6 text-slate">{article.description}</p>
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium sm:mt-auto sm:pt-4">
          Artikel lesen <ArrowRight size={17} strokeWidth={1.75} aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
