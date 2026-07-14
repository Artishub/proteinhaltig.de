# Project Map

Use `rg --files` first. This repo is small; avoid deep reads unless changing the area.

Core files:
- `package.json` - scripts and dependencies.
- `lib/data/drinks.seed.json` - static source data for brands, categories, products.
- `lib/data/drinks.ts` - product types, data export, computed protein helpers, grouping.
- `lib/data/brands.ts` - brand metadata derived from seed.
- `lib/data/categories.ts` - category metadata derived from seed.
- `scripts/validate-drinks-data.mjs` - data integrity checks.
- `scripts/validate-seo.mjs` - SEO checks.
- `scripts/validate-source-urls.mjs` - source URL checks.
- `scripts/validate-redirects.mjs` - redirect checks.
- `app/[locale]/produkte/page.tsx` - product listing route.
- `app/[locale]/produkte/[productId]/page.tsx` - SEO detail route.
- `components/product-explorer.tsx` - client-side filters, compare UI, cards.
- `app/globals.css` - Tailwind base and CSS variables.
- `next.config.ts` - legacy and canonical redirects.

Useful searches:
- Product by id/name: `rg '"product-id"|Product Name' lib/data/drinks.seed.json`
- Computed protein usage: `rg 'totalProteinGrams|proteinPortions|packageEnergyKcal'`
- SEO metadata/schema: `rg 'metadata|jsonLd|FAQ|structured' app lib components`
- Locale routes: quote paths containing brackets, e.g. `sed -n '1,160p' 'app/[locale]/produkte/page.tsx'`
