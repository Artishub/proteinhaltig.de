import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";

const ogImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Proteinhaltig.de - Proteinprodukte vergleichen",
};

export function pageMetadata({
  title,
  description,
  path,
  type = "website",
  absoluteTitle,
}: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  absoluteTitle?: string;
}): Metadata {
  return {
    title: absoluteTitle ? { absolute: absoluteTitle } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: `${siteUrl}${path}`,
      siteName: "Proteinhaltig.de",
      images: [ogImage],
      locale: "de_DE",
      type,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.url],
    },
  };
}
