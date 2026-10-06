"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ScatterPoint as ProductSummary } from "@/lib/product-summary";
import styles from "./ui.module.css";

type Hover = { item: ProductSummary; x: number; y: number };

const numberFormat = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 });
const pad = { top: 18, right: 14, bottom: 44, left: 42 };

// Protein (g) against energy (kcal) per 100 g or ml. Every dot is one product page.
// Guides: protein × 4 kcal = 12 % or 20 % of the energy (EU 1924/2006 "Proteinquelle" / "hoher Proteingehalt").
export function ProteinScatter({ items, categories, sourceShare, highShare }: {
  items: ProductSummary[];
  categories: { id: string; name: string }[];
  sourceShare: number;
  highShare: number;
}) {
  const plotRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<Hover | null>(null);
  const [category, setCategory] = useState("all");
  // Draw at the real width so axis text stays 12px on phones instead of shrinking with the viewBox.
  const [width, setWidth] = useState(720);
  const height = width < 520 ? 380 : 440;

  useEffect(() => {
    const element = plotRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(300, Math.round(entry.contentRect.width))));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const maxKcal = Math.max(500, Math.ceil(Math.max(...items.map((item) => item.kcal)) / 100) * 100);
  const maxProtein = 100;
  const x = (kcal: number) => pad.left + (kcal / maxKcal) * (width - pad.left - pad.right);
  const y = (protein: number) => height - pad.bottom - (protein / maxProtein) * (height - pad.top - pad.bottom);
  const xStep = width < 520 ? 200 : 100;
  const xTicks = Array.from({ length: Math.floor(maxKcal / xStep) + 1 }, (_, index) => index * xStep);
  const yTicks = [0, 20, 40, 60, 80, 100];

  // Protein grams at which protein delivers `share` of the energy: protein × 4 = share × kcal.
  const guideEnd = (share: number) => {
    const kcalAtTop = (maxProtein * 4) / share;
    return kcalAtTop <= maxKcal ? { kcal: kcalAtTop, protein: maxProtein } : { kcal: maxKcal, protein: (share * maxKcal) / 4 };
  };
  const labelKcal = maxKcal - 8;
  const high = guideEnd(highShare);
  const source = guideEnd(sourceShare);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) map.set(item.categoryId, (map.get(item.categoryId) ?? 0) + 1);
    return map;
  }, [items]);
  const ordered = useMemo(
    () => [...items].sort((a, b) => Number(a.categoryId === category) - Number(b.categoryId === category)),
    [items, category],
  );

  function show(item: ProductSummary, target: Element) {
    const plot = plotRef.current?.getBoundingClientRect();
    const mark = target.getBoundingClientRect();
    if (!plot) return;
    setHover({ item, x: mark.left + mark.width / 2 - plot.left, y: mark.top - plot.top });
  }

  return (
    <div className={styles.scatter}>
      <div className={styles.chipRow} role="group" aria-label="Kategorie hervorheben">
        <button type="button" aria-pressed={category === "all"} onClick={() => setCategory("all")}>Alle <span>{items.length}</span></button>
        {categories.filter((item) => counts.get(item.id)).map((item) => (
          <button key={item.id} type="button" aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>
            {item.name} <span>{counts.get(item.id)}</span>
          </button>
        ))}
      </div>

      <div className={styles.scatterPlot} ref={plotRef} onPointerLeave={() => setHover(null)}>
        <svg viewBox={`0 0 ${width} ${height}`} role="group" aria-label="Protein und Kalorien pro 100 g oder ml, ein Punkt pro Produkt">
          <polygon
            className={styles.scatterBand}
            points={[
              `${x(0)},${y(0)}`,
              `${x(high.kcal)},${y(high.protein)}`,
              high.protein < maxProtein ? `${x(maxKcal)},${y(maxProtein)}` : "",
              `${x(0)},${y(maxProtein)}`,
            ].filter(Boolean).join(" ")}
          />
          {yTicks.map((tick) => (
            <g key={`y${tick}`}>
              <line className={styles.scatterGrid} x1={pad.left} x2={width - pad.right} y1={y(tick)} y2={y(tick)} />
              <text className={styles.scatterTick} x={pad.left - 8} y={y(tick)} textAnchor="end" dominantBaseline="middle">{tick} g</text>
            </g>
          ))}
          {xTicks.map((tick) => (
            <text key={`x${tick}`} className={styles.scatterTick} x={x(tick)} y={height - pad.bottom + 18} textAnchor="middle">{tick}</text>
          ))}
          <text className={styles.scatterAxisLabel} x={width - pad.right} y={height - 6} textAnchor="end">kcal pro 100 g bzw. ml</text>

          <line className={styles.scatterGuide} x1={x(0)} y1={y(0)} x2={x(high.kcal)} y2={y(high.protein)} />
          <line className={styles.scatterGuideSoft} x1={x(0)} y1={y(0)} x2={x(source.kcal)} y2={y(source.protein)} />
          <text className={styles.scatterGuideLabel} x={x(labelKcal)} y={y((highShare * labelKcal) / 4) - 8} textAnchor="end">hoher Proteingehalt ab 20 %</text>
          <text className={styles.scatterGuideLabel} x={x(labelKcal)} y={y((sourceShare * labelKcal) / 4) - 8} textAnchor="end">Proteinquelle ab 12 %</text>

          {ordered.map((item) => {
            const muted = category !== "all" && item.categoryId !== category;
            return (
              <a
                key={item.id}
                href={item.href}
                className={muted ? styles.scatterDotMuted : styles.scatterDot}
                aria-label={`${item.brand} ${item.name}, ${numberFormat.format(item.per100)} g, ${item.kcal} kcal`}
                tabIndex={muted ? -1 : 0}
                onPointerEnter={(event) => show(item, event.currentTarget)}
                onFocus={(event) => show(item, event.currentTarget)}
                onBlur={() => setHover(null)}
              >
                <circle cx={x(item.kcal)} cy={y(Math.min(item.per100, maxProtein))} r={9} className={styles.scatterHit} />
                <circle cx={x(item.kcal)} cy={y(Math.min(item.per100, maxProtein))} r={4.5} />
              </a>
            );
          })}
        </svg>

        {hover && (
          <div className={styles.scatterTooltip} style={{ left: hover.x, top: hover.y }} role="status">
            <strong>{numberFormat.format(hover.item.per100)} g Protein · {hover.item.kcal} kcal</strong>
            <span>{hover.item.brand} {hover.item.name}</span>
            <small>pro 100 {hover.item.unit}{hover.item.density !== null ? ` · ${numberFormat.format(hover.item.density)} g pro 100 kcal` : ""}</small>
          </div>
        )}
      </div>
    </div>
  );
}
