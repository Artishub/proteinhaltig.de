import Link from "next/link";
import { Database } from "lucide-react";
import { HeaderSearch } from "@/components/header-search";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";

const nav = [
  { href: "/de/produkte", label: "Produkte" },
  { href: "/de/marken", label: "Alle Marken" },
  { href: "/de/kategorien", label: "Produkte nach Kategorie" },
  { href: "/de/wissen", label: "Wissenswertes" },
  { href: "/de/faq", label: "FAQ" },
];

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ locale: "de" }];
}

export default function LocaleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-30 bg-paper/80 px-2 py-2 backdrop-blur sm:px-3 sm:py-3">
        <div className="mx-auto flex min-h-12 max-w-page items-center justify-between gap-2 rounded-lg bg-paper px-2 py-1 sm:gap-3 sm:px-3">
          <Link href="/de" className="focus-ring flex shrink-0 items-center gap-1.5 rounded-md text-sm font-semibold tracking-tight sm:gap-2 sm:text-base">
            <Database size={17} strokeWidth={1.8} />
            proteinhaltig.de
          </Link>
          <nav className="hidden items-center gap-2 text-sm text-slate lg:flex" aria-label="Hauptnavigation">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="focus-ring rounded-md border border-transparent bg-mist px-3 py-1.5 hover:border-marigold hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
            <HeaderSearch />
            <ThemeToggle />
            <MobileNav items={nav} />
          </div>
        </div>
      </header>
      {children}
      <footer className="border-t border-ash">
        <div className="mx-auto grid max-w-page gap-6 px-4 py-10 text-sm text-slate md:grid-cols-[1fr_auto]">
          <p>Proteinhaltig.de ist ein unabhängiges Informationsprojekt. Angaben ohne Gewähr.</p>
          <div className="flex gap-4">
            <Link href="/de/impressum" className="hover:text-ink">Impressum</Link>
            <Link href="/de/datenschutz" className="hover:text-ink">Datenschutz</Link>
            <Link href="/de/nutzungsbedingungen" className="hover:text-ink">Nutzung</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
