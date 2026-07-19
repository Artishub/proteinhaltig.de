import type { MetadataRoute } from "next";
import { articles } from "@/lib/content/articles";
import { drinks } from "@/lib/data/drinks";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "/de",
    "/de/produkte",
    "/de/produkte/vergleich",
    "/de/marken",
    "/de/kategorien",
    "/de/wissen",
    "/de/faq",
    "/de/datenschutz",
    "/de/impressum",
    "/de/nutzungsbedingungen",
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${siteUrl}${route}`,
      lastModified: new Date(),
    })),
    ...articles.map((article) => ({
      url: `${siteUrl}/de/wissen/${article.slug}`,
      lastModified: new Date(),
    })),
    ...drinks.map((drink) => ({
      url: `${siteUrl}/de/produkte/${drink.id}`,
      lastModified: new Date(),
    })),
  ];
}
