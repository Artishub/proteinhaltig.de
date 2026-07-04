import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#fafafa",
          color: "#1a1a1a",
          padding: 72,
          fontFamily: "Arial",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30, fontWeight: 700 }}>
          <div
            style={{
              width: 34,
              height: 34,
              border: "3px solid #1a1a1a",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
            }}
          >
            g
          </div>
          proteinhaltig.de
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ color: "#6f6f6f", fontSize: 28, marginBottom: 24 }}>Proteinwerte aus Produkten nachschlagen</div>
          <h1 style={{ fontSize: 82, lineHeight: 0.98, letterSpacing: -3, margin: 0, maxWidth: 920 }}>
            Wie viel Protein steckt wirklich drin?
          </h1>
        </div>
        <div style={{ display: "flex", gap: 18, color: "#1a1a1a", fontSize: 25 }}>
          <span style={{ background: "#f1f1ef", border: "1px solid #eaeaea", borderRadius: 8, padding: "12px 18px" }}>
            pro 100 g/ml
          </span>
          <span style={{ background: "#f1f1ef", border: "1px solid #eaeaea", borderRadius: 8, padding: "12px 18px" }}>
            pro Packung
          </span>
          <span style={{ background: "#ffb84d", borderRadius: 8, padding: "12px 18px" }}>mit Quellen</span>
        </div>
      </div>
    ),
    size,
  );
}
