import Link from "next/link";
import { HeaderNav, type HeaderNavItem } from "@/components/header-nav";
import { HeaderSearch } from "@/components/header-search";
import { MobileNav } from "@/components/mobile-nav";
import { SiteLogo } from "@/components/site-logo";
import { ThemeToggle } from "@/components/theme-toggle";

const nav: HeaderNavItem[] = [
  { href: "/de/produkte", label: "Produkte" },
  { href: "/de/produkte/vergleich", label: "Vergleichen" },
  { href: "/de/marken", label: "Alle Marken" },
  { href: "/de/kategorien", label: "Produkte nach Kategorie" },
  {
    label: "Ratgeber",
    children: [
      { href: "/de/wissen", label: "Wissenswertes" },
      { href: "/de/faq", label: "FAQ" },
    ],
  },
];

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ locale: "de" }];
}

export default function LocaleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-30 border-b border-ash/70 bg-paper/85 px-2 py-2 backdrop-blur-xl">
        <div className="mx-auto flex min-h-12 max-w-page items-center justify-between gap-2 py-1 sm:gap-3">
          <Link href="/de" className="focus-ring flex shrink-0 rounded-md">
            <SiteLogo />
          </Link>
          <HeaderNav items={nav} />
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
          <div className="space-y-4">
            <p>Proteinhaltig.de ist ein unabhängiges Informationsprojekt.<br />Angaben ohne Gewähr.</p>
            <nav aria-label="Weitere Projekte" className="flex flex-wrap gap-x-4 gap-y-2">
              <span className="text-ink">Weitere Projekte</span>
              <a href="https://aivergleich.de" className="hover:text-ink">AIvergleich.de</a>
              <a href="https://www.zuckerhaltig.de" className="hover:text-ink">Zuckerhaltig.de</a>
              <span aria-current="page">Proteinhaltig.de</span>
            </nav>
          </div>
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
