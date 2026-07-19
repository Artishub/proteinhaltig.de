"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { brands } from "@/lib/data/brands";
import { drinks } from "@/lib/data/drinks";

const frequentSearches = ["Proteinriegel", "Skyr", "Protein Pudding", "Whey"];

export function HeaderSearch() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return [];
    return drinks
      .filter((drink) => {
        const brand = brands.find((item) => item.id === drink.brandId)?.name ?? "";
        return `${drink.name} ${brand}`.toLowerCase().includes(value);
      })
      .slice(0, 5);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();

    const close = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  const go = (value: string) => {
    const q = value.trim();
    if (!q) return;
    setOpen(false);
    setQuery(q);
    router.push(`/de/produkte?q=${encodeURIComponent(q)}`);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    go(query);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className="relative flex min-w-0 justify-end">
      <form
        onSubmit={submit}
        className={`flex h-9 items-center rounded-md border bg-mist transition-[width,border-color] duration-200 focus-within:border-marigold ${
          open ? "w-[34vw] max-w-[170px] sm:w-[220px] sm:max-w-[220px]" : "w-9 border-ash"
        }`}
        role="search"
      >
        <button
          type="button"
          onClick={() => {
            if (open) go(query);
            else setOpen(true);
          }}
          className="focus-ring inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
          aria-label={open ? "Suche absenden" : "Produktsuche öffnen"}
          aria-expanded={open}
          aria-controls="header-search-results"
        >
          <Search size={16} strokeWidth={1.75} aria-hidden="true" />
        </button>
        {open && (
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Produkt suchen"
            aria-label="Produkt suchen"
            className="min-w-0 flex-1 bg-transparent pr-3 text-sm outline-none placeholder:text-slate"
          />
        )}
      </form>

      {open && (
        <div
          id="header-search-results"
          className="absolute right-0 top-11 z-40 w-[min(84vw,300px)] overflow-hidden rounded-lg border border-ash bg-mist text-sm shadow-[0_18px_50px_rgba(23,32,29,0.1)]"
        >
          {!query.trim() ? (
            <div className="p-2">
              <p className="px-2 pb-2 pt-1 text-xs font-medium text-slate">Häufig gesucht</p>
              {frequentSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => go(term)}
                  className="focus-ring flex w-full items-center justify-between rounded-md px-2 py-2.5 text-left hover:bg-paper"
                >
                  <span>{term}</span>
                  <Search size={14} strokeWidth={1.75} aria-hidden="true" />
                </button>
              ))}
            </div>
          ) : results.length ? (
            results.map((drink) => {
              const brand = brands.find((item) => item.id === drink.brandId)?.name ?? "";
              return (
                <button
                  key={drink.id}
                  type="button"
                  onClick={() => go(drink.name)}
                  className="focus-ring grid w-full gap-1 border-b border-ash px-3 py-3 text-left last:border-0 hover:bg-paper"
                >
                  <span className="font-medium">{drink.name}</span>
                  <span className="text-xs text-slate">{brand} · Suche öffnen</span>
                </button>
              );
            })
          ) : (
            <button type="button" onClick={() => go(query)} className="focus-ring w-full px-3 py-3 text-left hover:bg-paper">
              Suche nach „{query}“
            </button>
          )}
        </div>
      )}
    </div>
  );
}
