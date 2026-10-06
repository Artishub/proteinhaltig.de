import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articleBySlug, articles } from "@/lib/content/articles";
import ui from "@/components/ui/ui.module.css";
import { pageMetadata } from "@/lib/seo";

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
  return pageMetadata({
    title: article.title,
    description: article.description,
    path: `/de/wissen/${article.slug}`,
    type: "article",
    ...(article.image ? { image: article.image } : {}),
  });
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = articleBySlug[slug];
  if (!article) notFound();

  const related = relatedLinks[article.slug] ?? [];

  return (
    <main className={ui.page}>
      <article className={ui.prose}>
        <p className={ui.metaLine}>{article.minutes} Minuten Lesezeit</p>
        <h1>{article.title}</h1>
        <p className={ui.lead}>{article.description}</p>
        {article.image && (
          <Image
            src={article.image.src}
            alt={article.image.alt}
            width={article.image.width}
            height={article.image.height}
            sizes="(max-width: 768px) calc(100vw - 2.5rem), 704px"
            className={ui.articleImage}
            priority
          />
        )}
        {article.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </article>
      <nav className={`${ui.chips} ${ui.proseChips}`} aria-label="Weiterlesen">
        {related.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
        <Link href="/de/proteinbedarf-rechner">Proteinbedarf berechnen</Link>
        <Link href="/de/wissen">Alle Artikel</Link>
      </nav>
    </main>
  );
}

const relatedLinks: Record<string, { href: string; label: string }[]> = {
  "proteinriegel-vergleichen": [{ href: "/de/kategorien/protein-bar", label: "Proteinriegel im Vergleich" }],
  "protein-joghurt-skyr-quark": [{ href: "/de/kategorien/skyr-quark", label: "Skyr und Quark im Vergleich" }, { href: "/de/kategorien/protein-yogurt", label: "Protein-Joghurt" }],
  "proteinpulver-portionsgroesse": [{ href: "/de/kategorien/protein-powder", label: "Proteinpulver im Vergleich" }],
  "pflanzliches-protein-vergleichen": [{ href: "/de/kategorien/plant-protein", label: "Pflanzliches Protein im Vergleich" }],
  "protein-pro-100g-verstehen": [{ href: "/de/produkte", label: "Alle Produkte" }],
};
