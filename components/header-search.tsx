"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { brands } from "@/lib/data/brands";
import { drinks } from "@/lib/data/drinks";

export function HeaderSearch() {
  const router = useRouter();
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

  return (
    <div className="relative min-w-0">
      <form onSubmit={submit} className="flex h-9 w-[34vw] max-w-[170px] items-center gap-2 rounded-md border border-ash bg-paper px-3 transition focus-within:border-marigold sm:w-[220px] sm:max-w-[220px]">
        <Search size={15} />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Produkt suchen"
          aria-label="Produkt suchen"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate"
        />
      </form>
      {open && query.trim() && (
        <div className="absolute right-0 top-11 z-40 w-[min(84vw,280px)] overflow-hidden rounded-lg border border-ash bg-paper text-sm">
          {results.length ? (
            results.map((drink) => {
              const brand = brands.find((item) => item.id === drink.brandId)?.name ?? "";
              return (
                <button
                  key={drink.id}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => go(drink.name)}
                  className="grid w-full gap-1 border-b border-ash px-3 py-3 text-left last:border-0 hover:bg-mist"
                >
                  <span className="font-medium">{drink.name}</span>
                  <span className="text-xs text-slate">{brand} · Filter öffnen</span>
                </button>
              );
            })
          ) : (
            <button onMouseDown={(event) => event.preventDefault()} onClick={() => go(query)} className="w-full px-3 py-3 text-left hover:bg-mist">
              Suche nach “{query}”
            </button>
          )}
        </div>
      )}
    </div>
  );
}
