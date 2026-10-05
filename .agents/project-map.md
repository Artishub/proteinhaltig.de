# Project Map

Use `rg --files` first. `CLAUDE.md` explains the data flow, routing and indexing.

Core files:
- `lib/data/products.seed.json` - source data for brands, categories, products (never read whole; use `npm run product`).
- `lib/data/products.ts` - product type, data export, derived protein/kcal helpers, grouping.
- `lib/page-routing.ts`, `lib/product-redirects.ts`, `middleware.ts` - one page per product and redirects.
- `lib/seo-index.ts`, `lib/data/indexed-products.json` - indexing allowlist.
- `lib/protein-context.ts`, `lib/product-facts.ts` - EU/DGE reference values and data-only facts.
- `app/[locale]/produkte/[productId]/page.tsx` - product page.
- `components/product-explorer.tsx` - client-side list, filters and sorting.
- `components/cookie-consent.tsx` - consent banner, loads Google Analytics after consent.
- `scripts/validate-products-data.mjs`, `scripts/seo-smoke-test.mjs` - data and SEO checks.
- `app/globals.css`, `tailwind.config.ts` - design tokens.
