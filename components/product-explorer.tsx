"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, BarChart3, ChevronDown, ChevronLeft, ChevronRight, LinkIcon, Search, X } from "lucide-react";
import { brands } from "@/lib/data/brands";
import { categories, categoryById } from "@/lib/data/categories";
import {
  Product,
  ProductDisplayItem,
  products,
  groupedProductFamilies,
  packageEnergyKcal,
  proteinPer100,
  proteinPer100Kcal,
  packageProtein,
  sizeLabel,
  uniqueProductRepresentatives,
  verificationLabel,
} from "@/lib/data/products";
import { productPageHref } from "@/lib/page-routing";

type SortKey = "total-desc" | "total-asc" | "per100-desc" | "per100-asc" | "kcal-desc" | "name-asc" | "name-desc";

const sizes = [
  { label: "Alle Packungen", value: "all" },
  { label: "bis 60 g/ml", value: "small" },
  { label: "61-250 g/ml", value: "medium" },
  { label: "über 250 g/ml", value: "large" },
];
const minProteinWhenExcludingLow = 5;

function matchesSize(product: Product, size: string) {
  if (!product.packageSize) return size === "all";
  if (size === "small") return product.packageSize <= 60;
  if (size === "medium") return product.packageSize > 60 && product.packageSize <= 250;
  if (size === "large") return product.packageSize > 250;
  return true;
}

export function ProductExplorer() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("all");
  const [category, setCategory] = useState("all");
  const [size, setSize] = useState("all");
  const [sort, setSort] = useState<SortKey>("per100-desc");
  const [compactGroups, setCompactGroups] = useState(false);
  const [excludeLowProtein, setExcludeLowProtein] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [openId, setOpenId] = useState<string | null>(products[0]?.id ?? null);

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
    const matching = products
      .filter((product) => {
        const brandName = brands.find((item) => item.id === product.brandId)?.name ?? "";
        const haystack = `${product.name} ${brandName}`.toLowerCase();
        return (
          (!normalizedQuery || haystack.includes(normalizedQuery)) &&
          (brand === "all" || product.brandId === brand) &&
          (category === "all" || product.categoryId === category) &&
          matchesSize(product, size) &&
          (!excludeLowProtein || proteinPer100(product) >= minProteinWhenExcludingLow)
        );
      });

    const sortedItems = sort.startsWith("per100") || sort === "kcal-desc" ? uniqueProductRepresentatives(matching) : matching;

    return sortedItems.sort((a, b) => {
      if (sort === "per100-desc") return compareNullable(proteinPer100(a), proteinPer100(b), "desc");
      if (sort === "per100-asc") return compareNullable(proteinPer100(a), proteinPer100(b), "asc");
      if (sort === "kcal-desc") return compareNullable(proteinPer100Kcal(a), proteinPer100Kcal(b), "desc");
      if (sort === "name-asc") return a.name.localeCompare(b.name, "de");
      if (sort === "name-desc") return b.name.localeCompare(a.name, "de");
      if (sort === "total-asc") return compareNullable(packageProtein(a), packageProtein(b), "asc");
      return compareNullable(packageProtein(a), packageProtein(b), "desc");
    });
  }, [brand, category, excludeLowProtein, query, size, sort]);

  const reset = () => {
    setQuery("");
    setBrand("all");
    setCategory("all");
    setSize("all");
    setSort("per100-desc");
    setExcludeLowProtein(false);
    setPage(1);
    window.history.replaceState(null, "", window.location.pathname);
  };

  useEffect(() => {
    setPage(1);
  }, [brand, category, compactGroups, excludeLowProtein, query, size, sort, pageSize]);

  const displayItems = useMemo(
    () => (compactGroups ? groupedProductFamilies(filtered) : filtered.map((product) => ({ type: "product", id: product.id, product }) as ProductDisplayItem)),
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
                { label: "pro 100 kcal absteigend", value: "kcal-desc" },
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
            const product = item.type === "product" ? item.product : item.representative;
            const brandName = brands.find((brandItem) => brandItem.id === product.brandId)?.name ?? "";
            const categoryData = categoryById[product.categoryId];
            const isOpen = openId === item.id;
            const title = item.type === "group" ? `${brandName} - Mehrere` : product.name;
            const subtitle =
              item.type === "group"
                ? `${categoryData?.name ?? "Produkt"} · ${item.products.length} Produkte`
                : `${brandName} · ${sizeLabel(product)}`;
            const per100 = item.type === "group" ? maxNullable(item.products.map(proteinPer100)) : proteinPer100(product);
            const total = item.type === "group" ? maxNullable(item.products.map(packageProtein)) : packageProtein(product);

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
                          {item.products.map((groupProduct) => (
                            <Link key={groupProduct.id} href={productPageHref(groupProduct)} className="rounded-md bg-paper px-2 py-1 text-xs text-slate hover:text-ink">
                              {groupProduct.name}
                            </Link>
                          ))}
                        </div>
                      )}
                      <p className="leading-6">
                        {item.type === "group"
                          ? groupSentence(item.products, brandName, categoryData?.name ?? "Produkt")
                          : productSentence(product, brandName, categoryData?.name ?? "Produkt")}
                      </p>
                    </div>
                    <div className="space-y-2 leading-6">
                      <p><span className="text-ink">{formatOptionalGrams(item.type === "group" ? maxNullable(item.products.map(proteinPer100Kcal)) : proteinPer100Kcal(product))} Protein</span> pro 100 kcal</p>
                      <p>{item.type === "group" ? rangeLine(item.products) : calculationLine(product)}</p>
                      <div className="mt-7 flex flex-col items-start gap-2">
                        <Link
                          href={`/de/produkte/vergleich?product=${product.id}`}
                          className="focus-ring inline-flex h-10 items-center justify-center rounded-md border border-ash bg-paper px-4 text-sm font-medium hover:border-marigold"
                        >
                          Zum Vergleich
                        </Link>
                        <Link href={productPageHref(product)} className="focus-ring inline-flex h-10 items-center justify-center rounded-md border border-ink bg-ink px-4 text-sm font-medium text-white hover:bg-paper hover:text-ink dark:text-black dark:hover:text-ink">
                          Zur Detailseite
                        </Link>
                        {product.sourceUrl ? (
                          <a href={product.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-ink underline decoration-ash underline-offset-4 hover:decoration-marigold">
                            <LinkIcon size={14} />
                            Quelle öffnen
                          </a>
                        ) : (
                          <p className="text-sm text-slate">{product.source}</p>
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

function productSentence(product: Product, brandName: string, categoryName: string) {
  const energy = packageEnergyKcal(product);
  const parts = [`${brandName} · ${categoryName} · ${sizeLabel(product)}`];
  if (energy !== null) parts.push(`${formatNumber(energy)} kcal pro Packung`);
  parts.push(`Quelle: ${product.source} (${verificationLabel(product)}, geprüft am ${formatDate(product.lastCheckedAt)})`);
  return parts.join(". ") + ".";
}

function groupSentence(groupProducts: Product[], brandName: string, categoryName: string) {
  const sizes = Array.from(new Set(groupProducts.map(sizeLabel))).join(", ");
  return `${brandName} · ${categoryName} · ${groupProducts.length} Produkte in ${sizes}.`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 }).format(value);
}

function formatOptionalGrams(value: number | null) {
  return value === null ? "/" : `${formatNumber(value)} g`;
}

function calculationLine(product: Product) {
  const per100 = proteinPer100(product);
  const total = packageProtein(product);
  if (!product.packageSize || total === null) return `${formatNumber(per100)} g Protein pro 100 ${product.unit}`;
  return `${formatNumber(per100)} g × ${sizeLabel(product)} / 100 = ${formatNumber(total)} g Protein`;
}

function rangeLine(products: Product[]) {
  const values = products.map(proteinPer100);
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

function Metric({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="text-left md:text-right">
      <p className="text-xs text-slate">{label}</p>
      <p className={`mt-1 tabular-nums ${strong ? "text-lg font-medium md:text-xl" : "font-medium"}`}>{value}</p>
    </div>
  );
}
