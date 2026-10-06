import type { Metadata } from "next";
import { NewsletterForm } from "@/components/newsletter-form";
import ui from "@/components/ui/ui.module.css";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Newsletter",
    description: "Neue Proteinprodukte, korrigierte Werte und Vergleiche aus der Datenbank, höchstens einmal im Monat per E-Mail.",
    path: "/de/newsletter",
  }),
  robots: { index: false, follow: true },
};

export default function NewsletterPage() {
  return (
    <main className={ui.page}>
      <article className={ui.prose}>
        <h1>Newsletter</h1>
        <p>Höchstens einmal im Monat: neue Produkte in der Datenbank, korrigierte Werte und ein Vergleich, der sich lohnt. Keine Werbung von Dritten.</p>
        <div style={{ marginTop: "1.5rem" }}><NewsletterForm /></div>
      </article>
    </main>
  );
}
