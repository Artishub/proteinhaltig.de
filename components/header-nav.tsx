"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export type HeaderNavItem =
  | { href: string; label: string }
  | { label: string; children: Array<{ href: string; label: string }> };

export function HeaderNav({ items }: { items: HeaderNavItem[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;

    const close = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpen(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
    };

    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <nav ref={navRef} className="hidden items-center gap-2 text-sm text-slate lg:flex" aria-label="Hauptnavigation">
      {items.map((item) => {
        if ("href" in item) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="focus-ring rounded-full border border-transparent px-3 py-1.5 hover:bg-mist hover:text-ink"
            >
              {item.label}
            </Link>
          );
        }

        const expanded = open === item.label;
        return (
          <div key={item.label} className="relative">
            <button
              type="button"
              onClick={() => setOpen(expanded ? null : item.label)}
              className="focus-ring inline-flex items-center gap-1 rounded-full border border-transparent px-3 py-1.5 hover:bg-mist hover:text-ink"
              aria-expanded={expanded}
              aria-haspopup="menu"
            >
              {item.label}
              <ChevronDown
                className={`transition ${expanded ? "rotate-180" : ""}`}
                size={15}
                strokeWidth={1.75}
                aria-hidden="true"
              />
            </button>
            {expanded && (
              <div
                className="absolute left-0 top-10 z-40 min-w-52 overflow-hidden rounded-lg border border-ash bg-mist p-2 shadow-[0_18px_50px_rgba(23,32,29,0.1)]"
                role="menu"
              >
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={() => setOpen(null)}
                    className="focus-ring block rounded-md px-3 py-2.5 text-ink hover:bg-paper"
                    role="menuitem"
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
  );
}
