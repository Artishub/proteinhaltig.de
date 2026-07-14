import Link from "next/link";
import { HeaderSearch } from "@/components/header-search";
import { MobileNav } from "@/components/mobile-nav";
import { SiteLogo } from "@/components/site-logo";
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
      <header className="sticky top-0 z-30 border-b border-ash/70 bg-paper/85 px-2 py-2 backdrop-blur-xl sm:px-3 sm:py-3">
        <div className="mx-auto flex min-h-12 max-w-page items-center justify-between gap-2 px-2 py-1 sm:gap-3 sm:px-3">
          <Link href="/de" className="focus-ring flex shrink-0 rounded-md">
            <SiteLogo />
          </Link>
          <nav className="hidden items-center gap-2 text-sm text-slate lg:flex" aria-label="Hauptnavigation">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="focus-ring rounded-full border border-transparent px-3 py-1.5 hover:bg-mist hover:text-ink"
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
      <footer className="border-t border-ash bg-mist">
        <div className="mx-auto grid max-w-page gap-6 px-4 py-12 text-sm text-slate md:grid-cols-[1fr_auto]">
          <p>Proteinhaltig.de ist ein unabhängiges Informationsprojekt.<br />Angaben ohne Gewähr.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/de/impressum" className="hover:text-ink">Impressum</Link>
            <Link href="/de/datenschutz" className="hover:text-ink">Datenschutz</Link>
            <Link href="/de/nutzungsbedingungen" className="hover:text-ink">Nutzung</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
