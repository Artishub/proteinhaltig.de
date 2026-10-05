import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const description =
  "Vergleiche Proteinprodukte aus Deutschland: pro 100 g/ml, pro Packung, mit Quellen, Nährwerten und Proteinportionen.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Proteinhaltig.de",
    template: "%s | Proteinhaltig.de",
  },
  description,
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "Proteinhaltig.de",
    description,
    url: `${siteUrl}/de`,
    siteName: "Proteinhaltig.de",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Proteinhaltig.de - Proteinprodukte vergleichen",
      },
    ],
    locale: "de_DE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Proteinhaltig.de",
    description,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        {children}
      </body>
    </html>
  );
}
