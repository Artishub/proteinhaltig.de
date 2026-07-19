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
  image,
}: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  absoluteTitle?: string;
  image?: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
}): Metadata {
  const images = image
    ? [{ url: image.src, width: image.width, height: image.height, alt: image.alt }]
    : [ogImage];

  return {
    title: absoluteTitle ? { absolute: absoluteTitle } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: `${siteUrl}${path}`,
      siteName: "Proteinhaltig.de",
      images,
      locale: "de_DE",
      type,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [images[0].url],
    },
  };
}
