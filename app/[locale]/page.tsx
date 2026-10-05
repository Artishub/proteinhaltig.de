import type { Metadata } from "next";
import { HomePage } from "@/components/home-page";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Proteinprodukte vergleichen",
  description: "Protein in Riegeln, Pulver, Drinks, Skyr und Pudding vergleichen: pro Portion, pro 100 g und pro 100 kcal, jeder Wert mit Quelle und Prüfdatum.",
  path: "/de",
});

// The showcase rotates daily.
export const revalidate = 86400;

export default function Page() {
  return <HomePage />;
}
