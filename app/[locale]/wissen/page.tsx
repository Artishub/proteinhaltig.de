import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { articles } from "@/lib/content/articles";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Proteinprodukte verstehen",
  description: "Protein in Riegeln, Joghurt, Skyr, Drinks und Pulver nach 100 g/ml, Packung und Portion einordnen.",
  path: "/de/wissen",
});

export default function KnowledgePage() {
  return (
    <main className="mx-auto max-w-page px-4 py-10">
      <h1 className="text-4xl font-semibold tracking-tight">Proteinprodukte verstehen</h1>
      <div className="mt-6 grid gap-8 border-y border-ash py-8 md:grid-cols-[0.9fr_1.1fr]">
        <p className="text-2xl font-semibold leading-9 tracking-tight">
          Proteinclaims wirken ähnlich. Die Nährwerttabelle zeigt, ob Riegel, Joghurt, Skyr, Drink oder Pulver wirklich vergleichbar sind.
        </p>
        <div className="space-y-4 leading-7 text-slate">
          <p>Proteinhaltig.de trennt Protein pro 100 g/ml vom Protein pro Packung. Genau dort werden Portionsgrößen sichtbar.</p>
          <p>Ein einzelner Wert entscheidet nicht über Qualität. Kalorien, Zucker, Fett, Zutaten und der eigene Alltag gehören ebenfalls dazu.</p>
          <p>Die Artikel erklären die Rechnungen hinter der Produktsuche kurz und praktisch.</p>
        </div>
      </div>
      <section className="mt-10 rounded-lg border border-ash bg-mist p-5">
        <h2 className="text-2xl font-semibold tracking-tight">Häufig gesucht</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { href: "/de/wissen/protein-pro-100g-verstehen", label: "Protein pro 100 g" },
            { href: "/de/wissen/proteinriegel-vergleichen", label: "Proteinriegel vergleichen" },
            { href: "/de/wissen/protein-joghurt-skyr-quark", label: "Skyr und Protein-Joghurt" },
            { href: "/de/wissen/proteinpulver-portionsgroesse", label: "Proteinpulver Portion" },
            { href: "/de/produkte?category=protein-bar", label: "Proteinriegel öffnen" },
            { href: "/de/produkte?category=protein-pudding", label: "Protein-Pudding öffnen" },
          ].map((item) => (
            <Link key={item.label} href={item.href} className="focus-ring rounded-md border border-ash bg-paper px-3 py-2 text-sm hover:border-marigold">
              {item.label}
            </Link>
          ))}
        </div>
      </section>
      <h2 className="mt-10 text-2xl font-semibold tracking-tight">Weiter informieren</h2>
      <div className="mt-4 divide-y divide-ash border-y border-ash">
        {articles.map((article) => (
          <Link key={article.slug} href={`/de/wissen/${article.slug}`} className="grid gap-4 py-5 hover:bg-mist md:grid-cols-[1fr_auto] md:px-3">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">{article.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate">{article.description}</p>
            </div>
            <span className="inline-flex items-center gap-2 text-sm text-slate">
              {article.minutes} Min. <ArrowRight size={15} />
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
