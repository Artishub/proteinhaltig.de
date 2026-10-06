import type { Metadata } from "next";
import Link from "next/link";
import ui from "@/components/ui/ui.module.css";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Newsletter bestätigt",
    description: "Deine Anmeldung zum Newsletter von Proteinhaltig.de ist bestätigt. Er kommt höchstens einmal im Monat.",
    path: "/de/newsletter/bestaetigt",
  }),
  robots: { index: false, follow: true },
};

export default function NewsletterConfirmedPage() {
  return (
    <main className={ui.page}>
      <article className={ui.prose}>
        <h1>Danke, du bist dabei</h1>
        <p>Deine Anmeldung ist bestätigt. Der Newsletter kommt höchstens einmal im Monat, mit neuen Produkten, korrigierten Werten und Vergleichen aus der Datenbank.</p>
        <p><Link href="/de">Zur Startseite</Link></p>
      </article>
    </main>
  );
}
