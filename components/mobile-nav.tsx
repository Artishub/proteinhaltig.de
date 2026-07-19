"use client";

import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";
import type { HeaderNavItem } from "@/components/header-nav";

export function MobileNav({ items }: { items: HeaderNavItem[] }) {
  const [open, setOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  return (
    <div className="relative lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-ash bg-mist hover:border-marigold"
        aria-label={open ? "Navigation schließen" : "Navigation öffnen"}
        aria-expanded={open}
      >
        {open ? <X size={16} strokeWidth={1.75} aria-hidden="true" /> : <Menu size={16} strokeWidth={1.75} aria-hidden="true" />}
      </button>
      {open && (
        <nav
          className="fixed inset-x-0 top-[72px] z-50 grid gap-3 border-y border-ash bg-paper p-4 text-base shadow-lg"
          aria-label="Hauptnavigation"
        >
          {items.map((item) => {
            if ("href" in item) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="focus-ring flex min-h-14 items-center rounded-lg bg-mist px-4 font-medium text-ink hover:bg-cream"
                >
                  {item.label}
                </Link>
              );
            }

            const expanded = openGroup === item.label;
            return (
              <div key={item.label} className="rounded-lg bg-mist">
                <button
                  type="button"
                  onClick={() => setOpenGroup(expanded ? null : item.label)}
                  className="focus-ring flex min-h-14 w-full items-center justify-between rounded-lg px-4 font-medium text-ink"
                  aria-expanded={expanded}
                >
                  {item.label}
                  <ChevronDown
                    className={`transition ${expanded ? "rotate-180" : ""}`}
                    size={16}
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                </button>
                {expanded && (
                  <div className="grid gap-1 border-t border-ash p-2">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => {
                          setOpen(false);
                          setOpenGroup(null);
                        }}
                        className="focus-ring rounded-md bg-paper px-3 py-3 text-sm text-ink"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      )}
    </div>
  );
}
