import type { Metadata } from "next";
import ui from "@/components/ui/ui.module.css";
import { pageMetadata } from "@/lib/seo";
import { contactEmail } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Nutzungsbedingungen",
  description: "Nutzungsbedingungen für Proteinhaltig.de: Herkunft der Nährwerte, Prüfdatum, keine Ernährungsberatung und Kontakt für Korrekturen.",
  path: "/de/nutzungsbedingungen",
});

export default function TermsPage() {
  return (
    <main className={ui.page}>
      <article className={ui.prose}>
        <h1>Nutzungsbedingungen</h1>
        <h2>Inhalte</h2>
        <p>
          Proteinhaltig.de vergleicht Nährwerte von Proteinprodukten. Jeder Wert nennt seine Quelle, den Status (Hersteller, Händler oder Nährwertdatenbank) und das Datum der letzten Prüfung. Maßgeblich ist die Angabe auf der Verpackung.
        </p>
        <h2>Keine Ernährungsberatung</h2>
        <p>
          Die Seite ordnet Zahlen ein, sie ersetzt keine medizinische oder ernährungswissenschaftliche Beratung. Der Proteinbedarf-Rechner nutzt die Referenzwerte der DGE für gesunde Erwachsene.
        </p>
        <h2>Korrekturen</h2>
        <p>
          Wenn ein Wert nicht zur Packung passt, schreib an <a href={`mailto:${contactEmail}`}>{contactEmail}</a>. Wir prüfen die Quelle und passen den Eintrag an.
        </p>
      </article>
    </main>
  );
}
