import type { Metadata } from "next";
import ui from "@/components/ui/ui.module.css";
import { pageMetadata } from "@/lib/seo";
import { contactEmail } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Impressum",
  description: "Impressum von Proteinhaltig.de mit Anbieterkennzeichnung, Kontakt per E-Mail und Hinweis zur Verantwortung für Inhalte.",
  path: "/de/impressum",
});

export default function ImpressumPage() {
  return (
    <main className={ui.page}>
      <article className={ui.prose}>
        <h1>Impressum</h1>
        <h2>Angaben gemäß § 5 DDG</h2>
        <p>
          Artjom Gasarov
          <br />
          Wingertshecke 1
          <br />
          35392 Gießen
        </p>
        <h2>Kontakt</h2>
        <p>
          E-Mail: <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
        </p>
        <h2>Verantwortlich für den Inhalt</h2>
        <p>Artjom Gasarov, Anschrift wie oben.</p>
        <h2>Haftung für Inhalte</h2>
        <p>
          Die Nährwerte stammen aus den jeweils genannten Hersteller- und Händlerangaben und werden mit Prüfdatum gespeichert. Rezepturen können sich ändern; maßgeblich ist die Angabe auf der Verpackung. Fehler meldest du am schnellsten per E-Mail.
        </p>
      </article>
    </main>
  );
}
