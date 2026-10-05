import type { MetadataRoute } from "next";
import { articles } from "@/lib/content/articles";
import { products } from "@/lib/data/products";
import { isSearchIndexableProduct } from "@/lib/seo-index";
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
    ...products.filter(isSearchIndexableProduct).map((product) => ({
      url: `${siteUrl}/de/produkte/${product.id}`,
      lastModified: new Date(product.lastCheckedAt),
    })),
  ];
}
