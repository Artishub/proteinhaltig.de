import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Datenschutz",
  description: "Datenschutzhinweise für Proteinhaltig.de: Hosting, technische Zugriffsdaten und der aktuelle Stand ohne Nutzerkonten.",
  path: "/de/datenschutz",
});

export default function DatenschutzPage() {
  return <LegalPage title="Datenschutz" text="Dieses MVP speichert keine Nutzerkonten, setzt keine eigenen Tracking-Cookies und verarbeitet keine Formulare. Server-Logs des Hostings können technisch notwendige Zugriffsdaten enthalten." />;
}

function LegalPage({ title, text }: { title: string; text: string }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-6 leading-7 text-slate">{text}</p>
    </main>
  );
}
