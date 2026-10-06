"use client";

import { useCallback, useState } from "react";
import type { SearchEntry } from "@/lib/search-index";

let cache: Promise<SearchEntry[]> | null = null;

function loadIndex() {
  cache ??= fetch("/api/search-index").then((response) => (response.ok ? response.json() : [])).catch(() => {
    cache = null;
    return [];
  });
  return cache;
}

export function normalizeSearch(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

// Loads the index on first focus or input; returns entries matching every search term.
export function useSearchIndex() {
  const [entries, setEntries] = useState<SearchEntry[] | null>(null);
  const prepare = useCallback(() => {
    if (!entries) loadIndex().then(setEntries);
  }, [entries]);
  const search = useCallback((query: string, limit: number) => {
    const terms = normalizeSearch(query).split(" ").filter(Boolean);
    if (!terms.length || !entries) return [];
    return entries.filter((entry) => {
      const haystack = normalizeSearch(`${entry[1]} ${entry[2]} ${entry[3]}`);
      return terms.every((term) => haystack.includes(term));
    }).slice(0, limit);
  }, [entries]);
  return { ready: entries !== null, prepare, search };
}
