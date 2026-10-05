"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import ui from "@/components/ui/ui.module.css";
import styles from "./protein-calculator.module.css";

export type CalculatorProduct = {
  id: string;
  label: string;
  href: string;
  unit: string;
  per100: number;
  kcalPer100: number;
  defaultAmount: number;
};

type Line = { id: string; amount: number };

const numberFormat = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 });
const format = (value: number) => numberFormat.format(value);

function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

// Body weight × DGE reference value (0.8 g/kg under 65, 1.0 g/kg from 65), plus a plain sum of chosen products.
export function ProteinCalculator({ products, dgeUrl }: { products: CalculatorProduct[]; dgeUrl: string }) {
  const [weight, setWeight] = useState(75);
  const [age, setAge] = useState(35);
  const [lines, setLines] = useState<Line[]>([]);
  const [query, setQuery] = useState("");

  const perKg = age >= 65 ? 1.0 : 0.8;
  const validWeight = weight >= 30 && weight <= 250;
  const need = validWeight ? Math.round(weight * perKg) : null;

  const byId = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const index = useMemo(() => products.map((product) => ({ product, haystack: normalize(product.label) })), [products]);
  const matches = useMemo(() => {
    const terms = normalize(query).split(" ").filter(Boolean);
    if (!terms.length) return [];
    return index.filter(({ haystack }) => terms.every((term) => haystack.includes(term))).slice(0, 6).map(({ product }) => product);
  }, [index, query]);

  const rows = lines.map((line) => {
    const product = byId.get(line.id)!;
    return { line, product, protein: (product.per100 * line.amount) / 100, kcal: (product.kcalPer100 * line.amount) / 100 };
  });
  const totalProtein = rows.reduce((sum, row) => sum + row.protein, 0);
  const totalKcal = rows.reduce((sum, row) => sum + row.kcal, 0);

  function add(product: CalculatorProduct) {
    setLines((current) => (current.some((line) => line.id === product.id) || current.length >= 5 ? current : [...current, { id: product.id, amount: product.defaultAmount }]));
    setQuery("");
  }

  return (
    <div className={styles.calculator}>
      <section className={styles.panel} aria-labelledby="bedarf">
        <h2 id="bedarf">Dein Referenzwert</h2>
        <div className={styles.inputs}>
          <label>
            <span>Körpergewicht</span>
            <span className={styles.field}>
              <input type="number" inputMode="decimal" min={30} max={250} value={weight} onChange={(event) => setWeight(Number(event.target.value))} />
              <small>kg</small>
            </span>
          </label>
          <label>
            <span>Alter</span>
            <span className={styles.field}>
              <input type="number" inputMode="numeric" min={19} max={110} value={age} onChange={(event) => setAge(Number(event.target.value))} />
              <small>Jahre</small>
            </span>
          </label>
        </div>
        <p className={styles.result} aria-live="polite">
          <strong className="display">{need === null ? "–" : `${need} g`}</strong>
          <span>Protein pro Tag ({format(perKg)} g × {validWeight ? format(weight) : "–"} kg)</span>
        </p>
        <p className={styles.note}>
          Referenzwert der <a href={dgeUrl} target="_blank" rel="noreferrer">DGE</a> für gesunde Erwachsene: 0,8 g pro kg Körpergewicht von 19 bis unter 65 Jahren, 1,0 g ab 65.
        </p>
      </section>

      <section className={styles.panel} aria-labelledby="kombinieren">
        <h2 id="kombinieren">Mit Produkten zusammenrechnen</h2>
        <label className={ui.searchField}>
          <Plus size={18} aria-hidden="true" />
          <span className="sr-only">Produkt hinzufügen</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Produkt hinzufügen, z. B. Skyr" autoComplete="off" />
        </label>
        {matches.length > 0 && (
          <ul className={styles.matches}>
            {matches.map((product) => (
              <li key={product.id}><button type="button" onClick={() => add(product)}>{product.label} <small>{format(product.per100)} g / 100 {product.unit}</small></button></li>
            ))}
          </ul>
        )}

        {rows.length > 0 && (
          <table className={styles.lines}>
            <thead><tr><th scope="col">Produkt</th><th scope="col">Menge</th><th scope="col">Protein</th><th scope="col"><span className="sr-only">Entfernen</span></th></tr></thead>
            <tbody>
              {rows.map(({ line, product, protein }) => (
                <tr key={line.id}>
                  <th scope="row"><Link href={product.href}>{product.label}</Link></th>
                  <td>
                    <span className={styles.field}>
                      <input
                        type="number"
                        min={0}
                        max={3000}
                        value={line.amount}
                        aria-label={`Menge ${product.label}`}
                        onChange={(event) => setLines((current) => current.map((item) => (item.id === line.id ? { ...item, amount: Number(event.target.value) } : item)))}
                      />
                      <small>{product.unit}</small>
                    </span>
                  </td>
                  <td>{format(protein)} g</td>
                  <td><button type="button" className={styles.remove} aria-label={`${product.label} entfernen`} onClick={() => setLines((current) => current.filter((item) => item.id !== line.id))}><X size={16} /></button></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Summe</th>
                <td>{Math.round(totalKcal)} kcal</td>
                <td><strong>{format(totalProtein)} g</strong></td>
                <td />
              </tr>
            </tfoot>
          </table>
        )}
        {rows.length > 0 && need !== null && (
          <div className={styles.progress}>
            <div className={styles.progressBar} aria-hidden="true"><i style={{ width: `${Math.min((totalProtein / need) * 100, 100)}%` }} /></div>
            <p>{Math.round((totalProtein / need) * 100)} % von {need} g</p>
          </div>
        )}
      </section>
    </div>
  );
}
