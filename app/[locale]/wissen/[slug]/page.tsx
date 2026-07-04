import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articleBySlug, articles } from "@/lib/content/articles";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = articleBySlug[slug];
  if (!article) return {};
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `/de/wissen/${article.slug}` },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = articleBySlug[slug];
  if (!article) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-sm font-medium text-slate">{article.minutes} Minuten Lesezeit</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">{article.title}</h1>
      <p className="mt-5 text-lg leading-8 text-slate">{article.description}</p>
      <div className="mt-10 space-y-5 border-t border-ash pt-8 text-lg leading-8 text-ink">
        {article.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <section className="mt-10 border-t border-ash pt-8">
        <h2 className="text-2xl font-semibold tracking-tight">Passend dazu</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Link href="/de/produkte" className="rounded-lg border border-ash bg-mist p-4 hover:border-marigold">
            <p className="font-semibold">Produktdatenbank öffnen</p>
            <p className="mt-2 text-sm leading-6 text-slate">Alle Produkte nach Marke, Kategorie und Proteinwerten filtern.</p>
          </Link>
          <Link href="/de/faq" className="rounded-lg border border-ash bg-mist p-4 hover:border-marigold">
            <p className="font-semibold">FAQ lesen</p>
            <p className="mt-2 text-sm leading-6 text-slate">Kurze Antworten zu Protein pro 100 g/ml, Packung und Quellen.</p>
          </Link>
        </div>
      </section>
    </main>
  );
}
