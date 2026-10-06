"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useSearchIndex } from "@/components/use-search-index";
import styles from "./ui.module.css";

const numberFormat = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 });

export function HomeSearch() {
  const [query, setQuery] = useState("");
  const { ready, prepare, search } = useSearchIndex();
  const results = useMemo(() => search(query, 8), [search, query]);

  return (
    <div className={styles.search}>
      <label className={styles.searchField}>
        <Search size={20} aria-hidden="true" />
        <span className="sr-only">Produkt suchen</span>
        <input
          type="search"
          value={query}
          onFocus={prepare}
          onChange={(event) => {
            prepare();
            setQuery(event.target.value);
          }}
          placeholder="Riegel, Skyr, Whey oder Marke"
          autoComplete="off"
        />
      </label>
      {query.trim() && (
        <ul className={styles.searchResults} aria-live="polite">
          {!ready && <li className={styles.searchEmpty}>Suche wird geladen …</li>}
          {ready && results.length === 0 && <li className={styles.searchEmpty}>Kein Produkt gefunden.</li>}
          {results.map(([href, brand, name, category, size, per100, unit]) => (
            <li key={href}>
              <Link href={href}>
                <span>
                  <strong>{brand} {name}</strong>
                  <small>{category} · {size}</small>
                </span>
                <span className={styles.searchValue}>
                  <strong>{numberFormat.format(per100)} g</strong>
                  <small>pro 100 {unit}</small>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
