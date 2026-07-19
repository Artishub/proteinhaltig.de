"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, BarChart3, ChevronDown, ChevronLeft, ChevronRight, LinkIcon, Search, X } from "lucide-react";
import { brands } from "@/lib/data/brands";
import { categories, categoryById } from "@/lib/data/categories";
import {
  Drink,
  DrinkDisplayItem,
  drinks,
  groupedDrinkFamilies,
  packageEnergyKcal,
  proteinPer100Value,
  proteinPortions,
  totalProteinGrams,
  uniqueProductRepresentatives,
  verificationLabel,
} from "@/lib/data/drinks";

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
          (!excludeLowProtein || (proteinPer100Value(drink) ?? 0) >= minProteinWhenExcludingLow) &&
          (proteinPer100Value(drink) ?? 0) <= maxPer100 &&
          (totalProteinGrams(drink) ?? 0) <= maxTotal
        );
      });

    const sortedItems = sort.startsWith("per100") ? uniqueProductRepresentatives(matching) : matching;

    return sortedItems.sort((a, b) => {
      if (sort === "per100-desc") return compareNullable(proteinPer100Value(a), proteinPer100Value(b), "desc");
      if (sort === "per100-asc") return compareNullable(proteinPer100Value(a), proteinPer100Value(b), "asc");
      if (sort === "name-asc") return a.name.localeCompare(b.name, "de");
      if (sort === "name-desc") return b.name.localeCompare(a.name, "de");
      if (sort === "total-asc") return compareNullable(totalProteinGrams(a), totalProteinGrams(b), "asc");
      return compareNullable(totalProteinGrams(a), totalProteinGrams(b), "desc");
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
  const showPagination = displayItems.length > 15;
  const pageCount = Math.max(1, Math.ceil(displayItems.length / pageSize));
  const visibleItems = showPagination ? displayItems.slice((page - 1) * pageSize, page * pageSize) : displayItems;

  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="h-fit w-full min-w-0 border border-ash bg-mist lg:sticky lg:top-20">
        <div className="flex items-center justify-between border-b border-ash px-4 py-3">
          <h2 className="text-sm font-medium">Filter</h2>
        </div>
        <div className="space-y-4 p-4">
          <label className="block">
            <span className="text-xs font-medium text-slate">Suche</span>
            <div className="mt-2 flex h-10 items-center gap-2 rounded-md border-2 border-ink bg-paper px-3">
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
            <X size={15} strokeWidth={1.75} aria-hidden="true" />
            Zurücksetzen
          </button>
        </div>
      </aside>

      <section className="min-w-0">
        <Link
          href="/de/produkte/vergleich"
          className="focus-ring mb-6 flex flex-col gap-4 rounded-lg border border-ash bg-mist px-4 py-4 hover:border-marigold sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 size={18} strokeWidth={1.75} aria-hidden="true" />
              <h2 className="text-lg font-medium">Produkte vergleichen</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate">Stelle bis zu vier Produkte auf einer eigenen Vergleichsseite gegenüber.</p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 text-sm font-medium">
            Vergleich öffnen
            <ArrowRight size={17} strokeWidth={1.75} aria-hidden="true" />
          </span>
        </Link>
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
          {visibleItems.map((item) => {
            const drink = item.type === "drink" ? item.drink : item.representative;
            const brandName = brands.find((brandItem) => brandItem.id === drink.brandId)?.name ?? "";
            const categoryData = categoryById[drink.categoryId];
            const isOpen = openId === item.id;
            const title = item.type === "group" ? `${brandName} - Mehrere` : drink.name;
            const subtitle =
              item.type === "group"
                ? `${categoryData?.name ?? "Produkt"} · ${item.drinks.length} Produkte`
                : `${brandName} · ${sizeLabel(drink)}`;
            const per100 = item.type === "group" ? maxNullable(item.drinks.map(proteinPer100Value)) : proteinPer100Value(drink);
            const total = item.type === "group" ? maxNullable(item.drinks.map(totalProteinGrams)) : totalProteinGrams(drink);

            return (
              <article
                key={item.id}
                className="rounded-lg border border-ash bg-mist"
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  className="focus-ring relative grid w-full grid-cols-2 gap-x-3 gap-y-3 p-4 text-left md:grid-cols-[minmax(0,1fr)_120px_120px_36px] md:items-center"
                >
                  <div className="col-span-2 min-w-0 pr-8 md:col-span-1 md:pr-0">
                    <span className="inline-flex rounded-md bg-paper px-2 py-1 text-xs font-medium text-slate">{categoryData?.name}</span>
                    <h3 className="mt-2 text-base font-medium leading-tight tracking-[-0.02em] md:text-lg">{title}</h3>
                    <p className="mt-1 text-sm text-slate">{subtitle}</p>
                  </div>
                  <Metric label="pro 100 g/ml" value={formatOptionalGrams(per100)} />
                  <Metric label="gesamt" value={formatOptionalGrams(total)} strong />
                  <ChevronDown
                    className={`absolute right-4 top-4 transition md:static md:justify-self-end ${isOpen ? "rotate-180" : ""}`}
                    size={18}
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <div className="grid gap-4 border-t border-ash px-4 py-4 text-sm text-slate md:grid-cols-[1.4fr_0.8fr]">
                    <div>
                      {item.type === "group" && (
                        <div className="mb-4 flex flex-wrap gap-2">
                          {item.drinks.map((groupDrink) => (
                            <Link key={groupDrink.id} href={`/de/produkte/${groupDrink.id}`} className="rounded-md bg-paper px-2 py-1 text-xs text-slate hover:text-ink">
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
                      <p><span className="text-ink">{formatOptionalNumber(item.type === "group" ? maxNullable(item.drinks.map(proteinPortions)) : proteinPortions(drink))} Proteinportionen</span> bei 10 g pro Portion.</p>
                      <p>{item.type === "group" ? rangeLine(item.drinks) : calculationLine(drink)}</p>
                      <div className="mt-7 flex flex-col items-start gap-2">
                        <Link
                          href={`/de/produkte/vergleich?product=${drink.id}`}
                          className="focus-ring inline-flex h-10 items-center justify-center rounded-md border border-ash bg-paper px-4 text-sm font-medium hover:border-marigold"
                        >
                          Zum Vergleich
                        </Link>
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
              </article>
            );
          })}
          {!visibleItems.length && (
            <div className="rounded-lg border border-ash bg-mist p-6 text-sm text-slate">
              <p className="font-medium text-ink">Keine passenden Produkte gefunden.</p>
              <button type="button" onClick={reset} className="focus-ring mt-3 underline decoration-ash underline-offset-4 hover:decoration-marigold">
                Filter zurücksetzen
              </button>
            </div>
          )}
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

function productSentence(drink: Drink, brandName: string, categoryName: string) {
  const energy = packageEnergyKcal(drink);
  const checked = drink.lastCheckedAt ? ` zuletzt geprüft am ${formatDate(drink.lastCheckedAt)}` : "";
  const energyPart = energy === null ? "" : ` und rechnerisch etwa ${formatNumber(energy)} kcal`;
  const proteinPer100 = proteinPer100Value(drink);
  const total = totalProteinGrams(drink);
  const packagePart = drink.sizeMl && total !== null ? `; daraus ergeben sich ${formatNumber(total)} g Protein pro Packung${energyPart}` : ". Die Packungsgröße ist noch nicht hinterlegt";

  const proteinPart = proteinPer100 === null ? "ist der Proteinwert pro 100 g/ml noch nicht verifiziert" : `enthält es ${formatNumber(proteinPer100)} g Protein pro 100 g/ml${packagePart}`;
  return `${drink.name} von ${brandName} ist ein Produkt aus der Kategorie ${categoryName} im ${sizeLabel(drink)}. Laut hinterlegter Quelle ${proteinPart}. Die Angabe basiert auf „${drink.source}“${checked}. Status: ${verificationLabel(drink)}. ${drink.note}`;
}

function groupSentence(groupDrinks: Drink[], brandName: string, categoryName: string) {
  const values = groupDrinks.map(proteinPer100Value).filter((value): value is number => value !== null);
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
  const proteinPer100 = proteinPer100Value(drink);
  const total = totalProteinGrams(drink);
  if (proteinPer100 === null) return "Proteinwert noch nicht verifiziert; Gesamtprotein wird nachgetragen.";
  if (!drink.sizeMl || total === null) return "Packungsgröße noch nicht hinterlegt; Gesamtprotein wird nachgetragen.";
  return `${formatNumber(proteinPer100)} g × ${sizeLabel(drink)} / 100 = ${formatNumber(total)} g Protein`;
}

function rangeLine(drinks: Drink[]) {
  const values = drinks.map(proteinPer100Value).filter((value): value is number => value !== null);
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
      <span className={compact ? "whitespace-nowrap text-sm text-slate" : "text-xs font-medium text-slate"}>{label}</span>
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
      <span className="flex justify-between text-xs font-medium text-slate">
        {label}
        <span>{value} {unit}</span>
      </span>
      <input type="range" min="0" max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className="range-input mt-3 w-full" />
    </label>
  );
}

function Metric({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="text-left md:text-right">
      <p className="text-xs text-slate">{label}</p>
      <p className={`mt-1 tabular-nums ${strong ? "text-lg font-medium md:text-xl" : "font-medium"}`}>{value}</p>
    </div>
  );
}
