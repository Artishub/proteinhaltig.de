import type { Nutrition } from "@/lib/data/products";
import styles from "./ui.module.css";

// Where the calories come from, computed from the macros (protein and carbohydrates 4 kcal/g, fat 9 kcal/g,
// EU 1169/2011 Annex XIV). Shares refer to the macro sum, so they always add up to 100 %.
export function energySplit(nutrition: Nutrition) {
  const protein = nutrition.protein * 4;
  const carbs = nutrition.carbohydrates * 4;
  const fat = nutrition.fat * 9;
  const total = protein + carbs + fat;
  if (total <= 0) return null;
  return [
    { id: "protein", label: "Protein", share: protein / total },
    { id: "carbs", label: "Kohlenhydrate", share: carbs / total },
    { id: "fat", label: "Fett", share: fat / total },
  ];
}

export function EnergySplit({ nutrition, onStage = false }: { nutrition: Nutrition; onStage?: boolean }) {
  const parts = energySplit(nutrition);
  if (!parts) return null;
  return (
    <figure className={`${styles.split} ${onStage ? styles.splitOnStage : ""}`}>
      <figcaption>Woher die Kalorien kommen</figcaption>
      <div className={styles.splitBar} role="img" aria-label={parts.map((part) => `${part.label} ${Math.round(part.share * 100)} %`).join(", ")}>
        {parts.filter((part) => part.share > 0.005).map((part) => (
          <span key={part.id} className={styles[`macro_${part.id}`]} style={{ flexGrow: part.share }} />
        ))}
      </div>
      <ul className={styles.splitLegend}>
        {parts.map((part) => (
          <li key={part.id}><i className={styles[`macro_${part.id}`]} aria-hidden="true" />{part.label} <strong>{Math.round(part.share * 100)} %</strong></li>
        ))}
      </ul>
    </figure>
  );
}
