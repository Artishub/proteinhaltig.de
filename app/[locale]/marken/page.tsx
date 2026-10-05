import type { Metadata } from "next";
import { BrandSearchGrid } from "@/components/brand-search-grid";
import { brands } from "@/lib/data/brands";
import { categories } from "@/lib/data/categories";
import { products, packageProtein, uniqueProductRepresentatives } from "@/lib/data/products";
import { productPageHref } from "@/lib/page-routing";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Marken",
  description: "Markenübersicht der Produktdatenbank: Proteinprodukte nach Hersteller öffnen und direkt in der Suche filtern.",
  path: "/de/marken",
});

export default function BrandsPage() {
  const uniqueByBrand = Object.fromEntries(
    brands.map((brand) => [brand.id, uniqueProductRepresentatives(products.filter((product) => product.brandId === brand.id))]),
  );
  const counts = Object.fromEntries(
    brands.map((brand) => [brand.id, uniqueByBrand[brand.id].length]),
  );
  const topProducts = Object.fromEntries(
    brands.map((brand) => [
      brand.id,
      uniqueByBrand[brand.id]
        .sort((a, b) => (packageProtein(b) ?? -1) - (packageProtein(a) ?? -1))
        .slice(0, 3)
        .map((product) => ({ id: product.id, name: product.name, href: productPageHref(product) })),
    ]),
  );
  const brandSearchData = Object.fromEntries(
    brands.map((brand) => {
      const brandProducts = uniqueByBrand[brand.id];
      return [
        brand.id,
        {
          categories: Array.from(new Set(brandProducts.map((product) => product.categoryId))),
          text: brandProducts.map((product) => product.name).join(" "),
        },
      ];
    }),
  );

  return (
    <main className="mx-auto max-w-page px-4 py-10">
      <h1 className="text-4xl font-semibold tracking-[-0.02em]">Marken</h1>
      <p className="mt-4 max-w-2xl leading-7 text-slate">
        Vergleiche Proteinmarken nach Proteinwerten, Produktvarianten und Packungsgrößen. Jede Marke führt direkt zur gefilterten Produktsuche.
      </p>
      <BrandSearchGrid brands={brands} counts={counts} topProducts={topProducts} searchData={brandSearchData} categories={categories} />
    </main>
  );
}
