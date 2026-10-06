import type { Metadata } from "next";
import Link from "next/link";
import ui from "@/components/ui/ui.module.css";
import { faq, faqCategories } from "@/lib/content/faq";
import { pageMetadata } from "@/lib/seo";
import styles from "./faq.module.css";

export const metadata: Metadata = pageMetadata({
  title: "FAQ: Protein in Skyr, Riegeln und Pudding",
  description: "Wie viel Protein haben Skyr, Proteinriegel und Protein-Pudding? Antworten aus der Datenbank, dazu EU-Grenzwerte und der Tagesbedarf laut DGE.",
  path: "/de/faq",
});

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })),
  };

  return (
    <main className={ui.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className={ui.pageHead}>
        <h1>Häufige Fragen zu Protein</h1>
        <p className={ui.lead}>Die Zahlen in den Antworten kommen direkt aus der Produktdatenbank und ändern sich mit ihr.</p>
        <nav className={ui.chips} aria-label="Themen">
          {faqCategories.map((category) => <a key={category.id} href={`#${category.id}`}>{category.title}</a>)}
        </nav>
      </header>
      {faqCategories.map((category) => (
        <section key={category.id} id={category.id} className={`${ui.section} ${styles.group}`} aria-labelledby={`${category.id}-title`}>
          <h2 id={`${category.id}-title`}>{category.title}</h2>
          <div className={styles.list}>
            {category.items.map((item) => (
              <article key={item.question} className={styles.item}>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
                {item.href && <Link href={item.href}>{item.linkLabel}</Link>}
              </article>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
