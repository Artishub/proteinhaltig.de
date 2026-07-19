import type { Metadata } from "next";
import { FaqNav } from "@/components/faq-nav";
import { faq, faqCategories } from "@/lib/content/faq";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "FAQ: Proteinprodukte vergleichen",
  description: "Antworten zu Protein pro 100 g/ml, Protein pro Packung, Proteinportionen, Quellen und Produktvergleich.",
  path: "/de/faq",
});

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <main className="mx-auto max-w-page px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        <FaqNav categories={faqCategories} />
        <div>
          <h1 className="text-4xl font-semibold tracking-[-0.02em]">FAQ: Proteinprodukte</h1>
          <p className="mt-4 max-w-2xl leading-7 text-slate">
            Antworten auf Suchfragen wie „Wie viel Protein hat ein Riegel?“, „Wie vergleiche ich Skyr?“ und „Was bedeutet Protein pro 100 g?“.
          </p>
          <div className="mt-8 space-y-12">
            {faqCategories.map((category) => (
              <section key={category.id} id={category.id} className="scroll-mt-28">
                <div className="border-b border-ash pb-4">
                  <h2 className="text-2xl font-medium tracking-[-0.02em]">{category.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate">{category.intro}</p>
                </div>
                <div className="divide-y divide-ash">
                  {category.items.map((item) => (
                    <article key={item.question} className="py-5">
                      <h3 className="font-medium">{item.question}</h3>
                      <p className="mt-2 leading-7 text-slate">{item.answer}</p>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
