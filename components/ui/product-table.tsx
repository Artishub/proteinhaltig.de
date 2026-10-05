"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import styles from "./ui.module.css";

export type ProductTableRow = {
  id: string;
  href: string;
  name: string;
  secondary: string;
  unit: string;
  per100: number;
  portion: number | null;
  portionLabel: string | null;
  kcal: number;
  density: number | null;
  sugar: number;
  fat: number;
};

type SortKey = "name" | "per100" | "portion" | "kcal" | "density" | "sugar" | "fat";

const numberFormat = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 });
const format = (value: number | null) => (value === null ? "–" : numberFormat.format(value));

const columns: { key: SortKey; label: string; mobile?: boolean }[] = [
  { key: "per100", label: "Protein / 100", mobile: true },
  { key: "portion", label: "pro Portion" },
  { key: "density", label: "pro 100 kcal", mobile: true },
  { key: "kcal", label: "kcal / 100" },
  { key: "sugar", label: "Zucker / 100" },
  { key: "fat", label: "Fett / 100" },
];

// Sortable product table for brand and category pages. A real <table>, so search engines can read it.
export function ProductTable({ rows, initialSort = "per100", caption }: { rows: ProductTableRow[]; initialSort?: SortKey; caption: string }) {
  const [sort, setSort] = useState<SortKey>(initialSort);
  const [ascending, setAscending] = useState(false);
  const showPortion = rows.some((row) => row.portion !== null);

  const sorted = useMemo(() => {
    const value = (row: ProductTableRow) => (sort === "name" ? row.name : row[sort]);
    return [...rows].sort((a, b) => {
      const left = value(a);
      const right = value(b);
      if (typeof left === "string" || typeof right === "string") return String(left).localeCompare(String(right), "de") * (ascending ? 1 : -1);
      if (left === null && right === null) return 0;
      if (left === null) return 1;
      if (right === null) return -1;
      return (ascending ? left - right : right - left) || a.name.localeCompare(b.name, "de");
    });
  }, [rows, sort, ascending]);

  function toggle(key: SortKey) {
    if (key === sort) setAscending((value) => !value);
    else {
      setSort(key);
      setAscending(key === "name");
    }
  }

  const visible = columns.filter((column) => column.key !== "portion" || showPortion);

  return (
    <div className={styles.tableCard}>
      <table className={styles.table}>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <th scope="col" aria-sort={sort === "name" ? (ascending ? "ascending" : "descending") : "none"}>
              <button type="button" className={styles.sortButton} onClick={() => toggle("name")}>Produkt <SortIcon active={sort === "name"} ascending={ascending} /></button>
            </th>
            {visible.map((column) => (
              <th key={column.key} scope="col" className={column.mobile ? undefined : styles.hideMobile} aria-sort={sort === column.key ? (ascending ? "ascending" : "descending") : "none"}>
                <button type="button" className={styles.sortButton} onClick={() => toggle(column.key)}>{column.label} <SortIcon active={sort === column.key} ascending={ascending} /></button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={row.id}>
              <th scope="row">
                <Link href={row.href}>{row.name}</Link>
                <small className={styles.rowSecondary}>{row.secondary}</small>
              </th>
              <td>{format(row.per100)} g <small>/ 100 {row.unit}</small></td>
              {showPortion && <td className={styles.hideMobile}>{row.portion === null ? "–" : `${format(row.portion)} g`}{row.portionLabel && <small className={styles.rowSecondary}>{row.portionLabel}</small>}</td>}
              <td>{format(row.density)} g</td>
              <td className={styles.hideMobile}>{format(row.kcal)}</td>
              <td className={styles.hideMobile}>{format(row.sugar)} g</td>
              <td className={styles.hideMobile}>{format(row.fat)} g</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SortIcon({ active, ascending }: { active: boolean; ascending: boolean }) {
  if (!active) return null;
  return ascending ? <ArrowUp size={13} aria-hidden="true" /> : <ArrowDown size={13} aria-hidden="true" />;
}
