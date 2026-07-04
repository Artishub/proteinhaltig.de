"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { BarChart3, ChevronDown, ChevronLeft, ChevronRight, LinkIcon, Search, X } from "lucide-react";
import { brands } from "@/lib/data/brands";
import { categories, categoryById } from "@/lib/data/categories";
import { Drink, DrinkDisplayItem, drinks, groupedDrinkFamilies, packageEnergyKcal, sugarCubes, totalSugarGrams, uniqueProductRepresentatives } from "@/lib/data/drinks";

type SortKey = "total-desc" | "total-asc" | "per100-desc" | "per100-asc" | "name-asc" | "name-desc";

const sizes = [
  { label: "Alle Packungen", value: "all" },
  { label: "bis 60 g/ml", value: "small" },
  { label: "61-250 g/ml", value: "medium" },
  { label: "über 250 g/ml", value: "large" },
];
const minProteinWhenExcludingLow = 5;

function matchesSize(drink: Drink, size: string) {
  if (!drink.sizeMl) return size === "all";
  if (size === "small") return drink.sizeMl <= 60;
  if (size === "medium") return drink.sizeMl > 60 && drink.sizeMl <= 250;
  if (size === "large") return drink.sizeMl > 250;
  return true;
}

export function ProductExplorer() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("all");
  const [category, setCategory] = useState("all");
  const [size, setSize] = useState("all");
  const [maxPer100, setMaxPer100] = useState(80);
  const [maxTotal, setMaxTotal] = useState(60);
  const [sort, setSort] = useState<SortKey>("per100-desc");
  const [compactGroups, setCompactGroups] = useState(false);
  const [excludeLowProtein, setExcludeLowProtein] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [openId, setOpenId] = useState<string | null>(drinks[0]?.id ?? null);
  const [compareIds, setCompareIds] = useState(["", "", ""]);
  const [compareOpen, setCompareOpen] = useState(false);

  useEffect(() => {
    const nextQuery = searchParams.get("q") ?? "";
    const nextBrand = searchParams.get("brand") ?? "";
    const nextCategory = searchParams.get("category") ?? "";
    setQuery(nextQuery);
    setBrand("all");
    setCategory("all");
    if (brands.some((item) => item.id === nextBrand)) setBrand(nextBrand);
    if (categories.some((item) => item.id === nextCategory)) setCategory(nextCategory);
  }, [searchParams]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const matching = drinks
      .filter((drink) => {
        const brandName = brands.find((item) => item.id === drink.brandId)?.name ?? "";
        const haystack = `${drink.name} ${brandName}`.toLowerCase();
        return (
          (!normalizedQuery || haystack.includes(normalizedQuery)) &&
          (brand === "all" || drink.brandId === brand) &&
          (category === "all" || drink.categoryId === category) &&
          matchesSize(drink, size) &&
          (!excludeLowProtein || (drink.sugarPer100Ml ?? 0) >= minProteinWhenExcludingLow) &&
          (drink.sugarPer100Ml ?? 0) <= maxPer100 &&
          (totalSugarGrams(drink) ?? 0) <= maxTotal
        );
      });

    const sortedItems = sort.startsWith("per100") ? uniqueProductRepresentatives(matching) : matching;

    return sortedItems.sort((a, b) => {
      if (sort === "per100-desc") return compareNullable(a.sugarPer100Ml, b.sugarPer100Ml, "desc");
      if (sort === "per100-asc") return compareNullable(a.sugarPer100Ml, b.sugarPer100Ml, "asc");
      if (sort === "name-asc") return a.name.localeCompare(b.name, "de");
      if (sort === "name-desc") return b.name.localeCompare(a.name, "de");
      if (sort === "total-asc") return compareNullable(totalSugarGrams(a), totalSugarGrams(b), "asc");
      return compareNullable(totalSugarGrams(a), totalSugarGrams(b), "desc");
    });
  }, [brand, category, excludeLowProtein, maxPer100, maxTotal, query, size, sort]);

  const reset = () => {
    setQuery("");
    setBrand("all");
    setCategory("all");
    setSize("all");
    setMaxPer100(80);
    setMaxTotal(60);
    setSort("per100-desc");
    setExcludeLowProtein(false);
    setPage(1);
    window.history.replaceState(null, "", window.location.pathname);
  };

  useEffect(() => {
    setPage(1);
  }, [brand, category, compactGroups, excludeLowProtein, maxPer100, maxTotal, query, size, sort, pageSize]);

  const displayItems = useMemo(
    () => (compactGroups ? groupedDrinkFamilies(filtered) : filtered.map((drink) => ({ type: "drink", id: drink.id, drink }) as DrinkDisplayItem)),
    [compactGroups, filtered],
  );
  const compareDrinkOptions = useMemo(
    () => uniqueProductRepresentatives(drinks).sort((a, b) => a.name.localeCompare(b.name, "de")),
    [],
  );
  const compareDrinks = compareIds
    .map((id) => drinks.find((drink) => drink.id === id))
    .filter(isDrink);
  const showPagination = displayItems.length > 15;
  const pageCount = Math.max(1, Math.ceil(displayItems.length / pageSize));
  const visibleItems = showPagination ? displayItems.slice((page - 1) * pageSize, page * pageSize) : displayItems;
  const setCompareSlot = (index: number, id: string) => {
    setCompareIds((current) => current.map((value, slotIndex) => (slotIndex === index ? id : value)));
  };
  const addToCompare = (drink: Drink) => {
    setCompareIds((current) => {
      if (current.includes(drink.id)) return current;
      const openSlot = current.findIndex((value) => !value);
      if (openSlot === -1) return current;
      return current.map((value, index) => (index === openSlot ? drink.id : value));
    });
  };

  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="h-fit w-full min-w-0 border border-ash bg-paper lg:sticky lg:top-20">
        <div className="flex items-center justify-between border-b border-ash px-4 py-3">
          <h2 className="text-sm font-semibold">Filter</h2>
        </div>
        <div className="space-y-4 p-4">
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-slate">Suche</span>
            <div className="mt-2 flex h-10 items-center gap-2 rounded-md border border-marigold px-3">
              <Search size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Name oder Marke"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              />
            </div>
          </label>
          <Select label="Marke" value={brand} onChange={setBrand} options={[{ label: "Alle Marken", value: "all" }, ...brands.map((item) => ({ label: item.name, value: item.id }))]} />
          <Select label="Kategorie" value={category} onChange={setCategory} options={[{ label: "Alle Kategorien", value: "all" }, ...categories.map((item) => ({ label: item.name, value: item.id }))]} />
          <Select label="Packung" value={size} onChange={setSize} options={sizes} />
          <Select
            label="Varianten zusammenfassen"
            value={compactGroups ? "yes" : "no"}
            onChange={(value) => setCompactGroups(value === "yes")}
            options={[
              { label: "Nein", value: "no" },
              { label: "Ja", value: "yes" },
            ]}
          />
          <Select
            label="Unter 5 g ausschließen"
            value={excludeLowProtein ? "yes" : "no"}
            onChange={(value) => setExcludeLowProtein(value === "yes")}
            options={[
              { label: "Nein", value: "no" },
              { label: "Ja", value: "yes" },
            ]}
          />
          <Range label="Max. Protein pro 100 g/ml" value={maxPer100} max={80} step={1} unit="g" onChange={setMaxPer100} />
          <Range label="Max. Gesamtprotein" value={maxTotal} max={60} step={1} unit="g" onChange={setMaxTotal} />
          <button onClick={reset} className="focus-ring inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-ash text-sm hover:border-marigold">
            <X size={15} />
            Zurücksetzen
          </button>
        </div>
      </aside>

      <section className="min-w-0">
        <ComparePanel
          open={compareOpen}
          onToggle={() => setCompareOpen((value) => !value)}
          compareIds={compareIds}
          compareDrinks={compareDrinks}
          options={compareDrinkOptions}
          onSelect={setCompareSlot}
          onClear={(index) => setCompareSlot(index, "")}
        />
        <div className="mb-4 flex flex-col gap-3 border-b border-ash pb-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate">
            <strong className="text-ink">{displayItems.length}</strong> {compactGroups ? "Einträge" : "Produkte"} gefunden
          </p>
          <div className="flex min-w-0 items-center gap-2">
            <Select
              label="Sortierung"
              compact
              value={sort}
              onChange={(value) => setSort(value as SortKey)}
              options={[
                { label: "pro 100 g/ml absteigend", value: "per100-desc" },
                { label: "pro 100 g/ml aufsteigend", value: "per100-asc" },
                { label: "Gesamtprotein absteigend", value: "total-desc" },
                { label: "Gesamtprotein aufsteigend", value: "total-asc" },
                { label: "Name A-Z", value: "name-asc" },
                { label: "Name Z-A", value: "name-desc" },
              ]}
            />
          </div>
        </div>
        <div className="space-y-3" aria-live="polite">
          {visibleItems.map((item, index) => {
            const drink = item.type === "drink" ? item.drink : item.representative;
            const brandName = brands.find((brandItem) => brandItem.id === drink.brandId)?.name ?? "";
            const categoryData = categoryById[drink.categoryId];
            const isOpen = openId === item.id;
            const title = item.type === "group" ? `${brandName} - Mehrere` : drink.name;
            const subtitle =
              item.type === "group"
                ? `${categoryData?.name ?? "Produkt"} · ${item.drinks.length} Produkte`
                : `${brandName} · ${sizeLabel(drink)}`;
            const per100 = item.type === "group" ? maxNullable(item.drinks.map((groupDrink) => groupDrink.sugarPer100Ml)) : drink.sugarPer100Ml;
            const total = item.type === "group" ? maxNullable(item.drinks.map(totalSugarGrams)) : totalSugarGrams(drink);

            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.12) }}
                className="border-b border-ash bg-mist"
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  className="focus-ring grid w-full grid-cols-[1fr_auto_auto] gap-x-3 gap-y-2 p-3 text-left md:grid-cols-[1fr_120px_120px_36px] md:items-center md:p-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: categoryData?.color ?? "#838383" }} />
                      <span className="text-xs font-medium uppercase tracking-wide text-slate">{categoryData?.name}</span>
                    </div>
                    <h3 className="mt-2 text-base font-semibold leading-tight tracking-tight md:text-lg">{title}</h3>
                    <p className="mt-1 text-sm text-slate">{subtitle}</p>
                  </div>
                  <Metric label="pro 100 g/ml" value={formatOptionalGrams(per100)} />
                  <Metric label="gesamt" value={formatOptionalGrams(total)} strong />
                  <ChevronDown className={`col-start-3 justify-self-end self-end transition md:col-start-auto md:self-center ${isOpen ? "rotate-180" : ""}`} size={18} />
                </button>
                {isOpen && (
                  <div className="grid gap-4 border-t border-ash px-4 py-4 text-sm text-slate md:grid-cols-[1.4fr_0.8fr]">
                    <div>
                      {item.type === "group" && (
                        <div className="mb-4 flex flex-wrap gap-2">
                          {item.drinks.map((groupDrink) => (
                            <Link key={groupDrink.id} href={`/de/produkte/${groupDrink.id}`} className="rounded-md border border-ash bg-paper px-2 py-1 text-xs text-slate hover:border-marigold hover:text-ink">
                              {groupDrink.name}
                            </Link>
                          ))}
                        </div>
                      )}
                      <p className="leading-6">
                        {item.type === "group"
                          ? groupSentence(item.drinks, brandName, categoryData?.name ?? "Produkt")
                          : productSentence(drink, brandName, categoryData?.name ?? "Produkt")}
                      </p>
                    </div>
                    <div className="space-y-2 leading-6">
                      <p><span className="text-ink">{formatOptionalNumber(item.type === "group" ? maxNullable(item.drinks.map(sugarCubes)) : sugarCubes(drink))} Proteinportionen</span> bei 10 g pro Portion.</p>
                      <p>{item.type === "group" ? rangeLine(item.drinks) : calculationLine(drink)}</p>
                      <div className="mt-7 flex flex-col items-start gap-2">
                        <button
                          type="button"
                          onClick={() => addToCompare(drink)}
                          disabled={compareIds.includes(drink.id) || compareDrinks.length >= 3}
                          className="focus-ring inline-flex h-10 items-center justify-center rounded-md border border-ash bg-paper px-4 text-sm font-medium hover:border-marigold disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          {compareIds.includes(drink.id) ? "Im Vergleich" : "Zum Vergleich"}
                        </button>
                        <Link href={`/de/produkte/${drink.id}`} className="focus-ring inline-flex h-10 items-center justify-center rounded-md border border-ink bg-ink px-4 text-sm font-medium text-white hover:bg-paper hover:text-ink dark:text-black dark:hover:text-ink">
                          Zur Detailseite
                        </Link>
                        {drink.sourceUrl ? (
                          <a href={drink.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-ink underline decoration-ash underline-offset-4 hover:decoration-marigold">
                            <LinkIcon size={14} />
                            Quelle öffnen
                          </a>
                        ) : (
                          <p className="text-sm text-slate">{drink.source}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.article>
            );
          })}
        </div>
        {showPagination && (
          <div className="mt-5 flex flex-col gap-3 border-t border-ash pt-4 sm:flex-row sm:items-center sm:justify-between">
            <Select
              label="Pro Seite"
              compact
              value={String(pageSize)}
              onChange={(value) => setPageSize(Number(value))}
              options={[
                { label: "15", value: "15" },
                { label: "30", value: "30" },
                { label: "60", value: "60" },
              ]}
            />
            <div className="flex items-center gap-3 text-sm text-slate">
              <button
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={page === 1}
                className="focus-ring inline-flex h-9 items-center gap-2 rounded-md border border-ash px-3 disabled:opacity-40"
              >
                <ChevronLeft size={15} />
                Zurück
              </button>
              <span>
                Seite {page} von {pageCount}
              </span>
              <button
                onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
                disabled={page === pageCount}
                className="focus-ring inline-flex h-9 items-center gap-2 rounded-md border border-ash px-3 disabled:opacity-40"
              >
                Weiter
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function ComparePanel({
  open,
  onToggle,
  compareIds,
  compareDrinks,
  options,
  onSelect,
  onClear,
}: {
  open: boolean;
  onToggle: () => void;
  compareIds: string[];
  compareDrinks: Drink[];
  options: Drink[];
  onSelect: (index: number, id: string) => void;
  onClear: (index: number) => void;
}) {
  const maxPer100 = Math.max(...compareDrinks.map((drink) => drink.sugarPer100Ml ?? 0), 1);
  const maxTotal = Math.max(...compareDrinks.map((drink) => totalSugarGrams(drink) ?? 0), 1);

  return (
    <section className="mb-6 rounded-lg border border-ash bg-paper">
      <button
        type="button"
        onClick={onToggle}
        className="focus-ring flex w-full flex-col gap-3 px-4 py-4 text-left sm:flex-row sm:items-center sm:justify-between"
        aria-expanded={open}
      >
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 size={18} />
            <h2 className="text-lg font-semibold">Produkte vergleichen</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate">Wähle bis zu drei Produkte und vergleiche Protein, Kalorien und Nährwerte nebeneinander.</p>
        </div>
        <span className="flex items-center gap-3 text-sm text-slate">
          {compareDrinks.length}/3 ausgewählt
          <ChevronDown className={`transition ${open ? "rotate-180" : ""}`} size={18} />
        </span>
      </button>

      {open && (
        <div className="border-t border-ash p-4">
      <div className="grid gap-3 md:grid-cols-3">
        {compareIds.map((selectedId, index) => (
          <label key={index} className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-slate">Produkt {index + 1}</span>
            <div className="mt-2 flex gap-2">
              <DrinkCombobox
                value={selectedId}
                options={options}
                disabledIds={compareIds.filter((id) => id && id !== selectedId)}
                onChange={(id) => onSelect(index, id)}
              />
              {selectedId && (
                <button
                  type="button"
                  onClick={() => onClear(index)}
                  className="focus-ring inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-ash hover:border-marigold"
                  aria-label={`Produkt ${index + 1} entfernen`}
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </label>
        ))}
      </div>

      {compareDrinks.length ? (
        <>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {compareDrinks.map((drink) => {
              const brandName = brands.find((brandItem) => brandItem.id === drink.brandId)?.name ?? "";
              const categoryName = categoryById[drink.categoryId]?.name ?? "Produkt";
              const nutrition = drink.nutritionPer100Ml;

              return (
                <article key={drink.id} className="rounded-lg border border-ash bg-mist p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate">{categoryName}</p>
                  <h3 className="mt-2 text-base font-semibold leading-tight">{drink.name}</h3>
                  <p className="mt-1 text-sm text-slate">{brandName} · {sizeLabel(drink)}</p>
                  <dl className="mt-4 space-y-2 text-sm">
                    <CompareValue label="Protein pro 100 g/ml" value={formatOptionalGrams(drink.sugarPer100Ml)} strong />
                    <CompareValue label="Protein gesamt" value={formatOptionalGrams(totalSugarGrams(drink))} strong />
                    <CompareValue label="Proteinportionen" value={formatOptionalNumber(sugarCubes(drink))} />
                    <CompareValue label="Energie pro 100 g/ml" value={nutrition ? `${formatNumber(nutrition.energyKcal)} kcal` : "/"} />
                    <CompareValue label="Kohlenhydrate" value={nutrition ? `${formatNumber(nutrition.carbohydrates)} g` : "/"} />
                    <CompareValue label="Fett" value={nutrition ? `${formatNumber(nutrition.fat)} g` : "/"} />
                    <CompareValue label="Eiweiß" value={nutrition ? `${formatNumber(nutrition.protein)} g` : "/"} />
                    <CompareValue label="Salz" value={nutrition ? `${formatNumber(nutrition.salt)} g` : "/"} />
                  </dl>
                  <Link href={`/de/produkte/${drink.id}`} className="focus-ring mt-4 inline-flex rounded-md text-sm underline decoration-ash underline-offset-4 hover:decoration-marigold">
                    Detailseite öffnen
                  </Link>
                </article>
              );
            })}
          </div>

          <div className="mt-5 rounded-lg border border-ash bg-mist p-4">
            <h3 className="font-semibold">Proteinvergleich als Graph</h3>
            <div className="mt-4 space-y-5">
              <SugarBars label="Protein pro 100 g/ml" drinks={compareDrinks} max={maxPer100} value={(drink) => drink.sugarPer100Ml} suffix="g" />
              <SugarBars label="Gesamtprotein pro Packung" drinks={compareDrinks} max={maxTotal} value={totalSugarGrams} suffix="g" />
            </div>
          </div>
        </>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-ash bg-mist p-4 text-sm text-slate">
          Starte mit einem Produkt. Du kannst weitere Produkte über die Auswahlfelder oder über „Zum Vergleich“ in geöffneten Karten hinzufügen.
        </div>
      )}
        </div>
      )}
    </section>
  );
}

function DrinkCombobox({
  value,
  options,
  disabledIds,
  onChange,
}: {
  value: string;
  options: Drink[];
  disabledIds: string[];
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = options.find((drink) => drink.id === value);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return options
      .filter((drink) => {
        const brandName = brands.find((brand) => brand.id === drink.brandId)?.name ?? "";
        const haystack = `${drink.name} ${brandName} ${sizeLabel(drink)}`.toLowerCase();
        return !normalized || haystack.includes(normalized);
      })
      .slice(0, 40);
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    <div ref={containerRef} className="relative min-w-0 flex-1">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="focus-ring flex h-10 w-full items-center justify-between gap-2 rounded-md border border-ash bg-mist px-3 text-left text-sm outline-none hover:border-smoke"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="min-w-0 truncate">{selected ? `${selected.name} · ${sizeLabel(selected)}` : "Auswählen"}</span>
        <ChevronDown className={`shrink-0 transition ${open ? "rotate-180" : ""}`} size={16} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-12 z-30 rounded-md border border-ash bg-paper p-2 shadow-[0_18px_60px_rgba(26,26,26,0.12)]">
          <div className="flex h-9 items-center gap-2 rounded-md border border-ash px-2">
            <Search size={15} />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Produkt suchen"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </div>
          <div className="mt-2 max-h-64 overflow-y-auto" role="listbox">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setQuery("");
                setOpen(false);
              }}
              className="block w-full rounded px-2 py-2 text-left text-sm hover:bg-mist"
            >
              Auswählen
            </button>
            {filtered.map((drink) => {
              const disabled = disabledIds.includes(drink.id);
              return (
                <button
                  key={drink.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onChange(drink.id);
                    setQuery("");
                    setOpen(false);
                  }}
                  className="block w-full rounded px-2 py-2 text-left text-sm hover:bg-mist disabled:cursor-not-allowed disabled:opacity-40"
                  role="option"
                  aria-selected={drink.id === value}
                >
                  <span className="block truncate font-medium">{drink.name}</span>
                  <span className="block truncate text-xs text-slate">
                    {brands.find((brand) => brand.id === drink.brandId)?.name} · {sizeLabel(drink)}
                  </span>
                </button>
              );
            })}
            {!filtered.length && <p className="px-2 py-3 text-sm text-slate">Kein Produkt gefunden.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function CompareValue({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-ash pb-2 last:border-b-0">
      <dt className="text-slate">{label}</dt>
      <dd className={`text-right tabular-nums ${strong ? "font-semibold text-ink" : "text-ink"}`}>{value}</dd>
    </div>
  );
}

function SugarBars({ label, drinks, max, value, suffix }: { label: string; drinks: Drink[]; max: number; value: (drink: Drink) => number | null; suffix: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate">{label}</p>
      <div className="mt-2 space-y-2">
        {drinks.map((drink) => {
          const drinkValue = value(drink);
          const width = drinkValue === null ? 0 : Math.max(3, (drinkValue / max) * 100);
          return (
            <div key={drink.id} className="grid gap-2 sm:grid-cols-[160px_1fr_64px] sm:items-center">
              <p className="truncate text-sm font-medium">{drink.name}</p>
              <div className="h-3 overflow-hidden rounded-full bg-paper">
                <div className="h-full rounded-full bg-marigold" style={{ width: `${width}%` }} />
              </div>
              <p className="text-sm tabular-nums text-slate sm:text-right">{drinkValue === null ? "/" : `${formatNumber(drinkValue)} ${suffix}`}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function isDrink(value: Drink | undefined): value is Drink {
  return Boolean(value);
}

function productSentence(drink: Drink, brandName: string, categoryName: string) {
  const energy = packageEnergyKcal(drink);
  const checked = drink.lastCheckedAt ? ` zuletzt geprüft am ${formatDate(drink.lastCheckedAt)}` : "";
  const energyPart = energy === null ? "" : ` und rechnerisch etwa ${formatNumber(energy)} kcal`;
  const total = totalSugarGrams(drink);
  const packagePart = drink.sizeMl && total !== null ? `; daraus ergeben sich ${formatNumber(total)} g Protein pro Packung${energyPart}` : ". Die Packungsgröße ist noch nicht hinterlegt";

  const proteinPart = drink.sugarPer100Ml === null ? "ist der Proteinwert pro 100 g/ml noch nicht verifiziert" : `enthält es ${formatNumber(drink.sugarPer100Ml)} g Protein pro 100 g/ml${packagePart}`;
  return `${drink.name} von ${brandName} ist ein Produkt aus der Kategorie ${categoryName} im ${sizeLabel(drink)}. Laut hinterlegter Quelle ${proteinPart}. Die Angabe basiert auf „${drink.source}“${checked}. ${drink.note}`;
}

function groupSentence(groupDrinks: Drink[], brandName: string, categoryName: string) {
  const values = groupDrinks.map((drink) => drink.sugarPer100Ml).filter((value): value is number => value !== null);
  const sizes = Array.from(new Set(groupDrinks.map(sizeLabel))).join(", ");
  const products = groupDrinks.length;
  const valuePart = values.length ? `Die hinterlegten Varianten liegen zwischen ${formatNumber(Math.min(...values))} und ${formatNumber(Math.max(...values))} g Protein pro 100 g/ml` : "Für diese Varianten sind Proteinwerte noch nicht verifiziert";

  return `${brandName} - Mehrere fasst ${products} Produkte aus der Kategorie ${categoryName} zusammen. ${valuePart}; gespeicherte Packungen in dieser Gruppe sind ${sizes}. Öffne die einzelnen Varianten über die Suche oder deaktiviere die Zusammenfassung, wenn du Packungsgrößen und Produktdetails separat vergleichen möchtest.`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 }).format(value);
}

function formatOptionalNumber(value: number | null) {
  return value === null ? "/" : formatNumber(value);
}

function formatOptionalGrams(value: number | null) {
  return value === null ? "/" : `${formatNumber(value)} g`;
}

function sizeLabel(drink: Drink) {
  return drink.sizeMl ? `${drink.sizeMl} ${drink.packageUnit ?? "g"}` : "/";
}

function calculationLine(drink: Drink) {
  const total = totalSugarGrams(drink);
  if (drink.sugarPer100Ml === null) return "Proteinwert noch nicht verifiziert; Gesamtprotein wird nachgetragen.";
  if (!drink.sizeMl || total === null) return "Packungsgröße noch nicht hinterlegt; Gesamtprotein wird nachgetragen.";
  return `${formatNumber(drink.sugarPer100Ml)} g × ${sizeLabel(drink)} / 100 = ${formatNumber(total)} g Protein`;
}

function rangeLine(drinks: Drink[]) {
  const values = drinks.map((drink) => drink.sugarPer100Ml).filter((value): value is number => value !== null);
  if (!values.length) return "Proteinwerte in dieser Gruppe sind noch nicht verifiziert.";
  return `Spanne: ${formatNumber(Math.min(...values))} bis ${formatNumber(Math.max(...values))} g Protein pro 100 g/ml.`;
}

function maxNullable(values: Array<number | null>) {
  const numbers = values.filter((value): value is number => value !== null);
  return numbers.length ? Math.max(...numbers) : null;
}

function compareNullable(a: number | null, b: number | null, direction: "asc" | "desc") {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return direction === "asc" ? a - b : b - a;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("de-DE").format(new Date(value));
}

function Select({
  label,
  value,
  options,
  onChange,
  compact = false,
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
  compact?: boolean;
}) {
  return (
    <label className={compact ? "flex min-w-0 items-center gap-2" : "block"}>
      <span className={compact ? "whitespace-nowrap text-sm text-slate" : "text-xs font-medium uppercase tracking-wide text-slate"}>{label}</span>
      <div className={`relative min-w-0 ${compact ? "w-auto" : "mt-2 w-full"}`}>
        <select value={value} onChange={(event) => onChange(event.target.value)} className="focus-ring h-10 w-full appearance-none rounded-md border border-ash bg-paper px-3 pr-10 text-sm outline-none hover:border-smoke">
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink" size={16} />
      </div>
    </label>
  );
}

function Range({ label, value, max, step, unit, onChange }: { label: string; value: number; max: number; step: number; unit: string; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="flex justify-between text-xs font-medium uppercase tracking-wide text-slate">
        {label}
        <span>{value} {unit}</span>
      </span>
      <input type="range" min="0" max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className="mt-3 w-full accent-marigold" />
    </label>
  );
}

function Metric({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="text-right">
      <p className="text-xs uppercase tracking-wide text-slate">{label}</p>
      <p className={`mt-1 tabular-nums ${strong ? "text-lg font-semibold md:text-xl" : "font-medium"}`}>{value}</p>
    </div>
  );
}
