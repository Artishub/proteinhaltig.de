"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

type NavItem = {
  href: string;
  label: string;
};

export function MobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-ash bg-mist hover:border-marigold"
        aria-label={open ? "Navigation schließen" : "Navigation öffnen"}
        aria-expanded={open}
      >
        {open ? <X size={16} /> : <Menu size={16} />}
      </button>
      {open && (
        <nav
          className="fixed inset-x-0 top-[72px] z-50 grid gap-3 border-y border-ash bg-paper p-4 text-base shadow-lg"
          aria-label="Hauptnavigation"
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="focus-ring flex min-h-14 items-center rounded-lg bg-mist px-4 font-medium text-ink hover:bg-cream"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
