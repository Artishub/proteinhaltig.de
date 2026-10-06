import Link from "next/link";
import { SiteLogo } from "@/components/site-logo";

// Next adds noindex to 404 responses itself; no robots metadata here (see CLAUDE.md).
export const metadata = { title: "Seite nicht gefunden" };

const links = [
  { href: "/de/produkte", label: "Alle Produkte" },
  { href: "/de/kategorien", label: "Kategorien" },
  { href: "/de/marken", label: "Marken" },
  { href: "/de/produkte/vergleich", label: "Vergleichen" },
];

export default function NotFound() {
  return (
    <div className="theme-protein flex min-h-screen flex-col bg-paper px-5 py-8 text-ink">
      <Link href="/de" className="focus-ring w-fit rounded-md"><SiteLogo /></Link>
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center py-16">
        <p className="font-[family-name:var(--font-display)] text-6xl font-bold text-[var(--accent)]">404</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Diese Seite gibt es nicht</h1>
        <p className="mt-3 leading-7 text-slate">Vielleicht wurde das Produkt umbenannt oder die Adresse ist unvollständig. Über die Suche oder diese Seiten findest du weiter:</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/de" className="focus-ring rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper">Startseite</Link>
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="focus-ring rounded-full border border-ash px-4 py-2 text-sm font-semibold hover:border-ink">{link.label}</Link>
          ))}
        </div>
      </main>
    </div>
  );
}
