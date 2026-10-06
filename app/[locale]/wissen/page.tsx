import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ui from "@/components/ui/ui.module.css";
import { articles } from "@/lib/content/articles";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Proteinprodukte verstehen",
  description: "Kurze Artikel zu Protein pro 100 g, Proteinriegeln, Skyr und Quark, Proteinpulver und pflanzlichem Protein, mit Beispielen aus der Datenbank.",
  path: "/de/wissen",
});

export default function KnowledgePage() {
  return (
    <main className={ui.page}>
      <header className={ui.pageHead}>
        <h1>Proteinprodukte verstehen</h1>
        <p className={ui.lead}>Wie man Protein pro 100 g, pro Portion und pro 100 kcal liest, mit Beispielen aus der Datenbank.</p>
      </header>
      <section className={ui.section} aria-label="Artikel">
        <div className={ui.articleGrid}>
          {articles.map((article) => (
            <Link key={article.slug} href={`/de/wissen/${article.slug}`} className={ui.articleCard}>
              {article.image ? (
                <Image src={article.image.src} alt="" width={article.image.width} height={article.image.height} sizes="(max-width: 860px) 100vw, 33vw" />
              ) : (
                <div className={ui.articlePlaceholder} aria-hidden="true" />
              )}
              <span>{article.minutes} Min.</span>
              <h2 className={ui.articleTitle}>{article.title}</h2>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
