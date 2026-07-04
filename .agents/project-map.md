# Project Map

Use `rg --files` first. This repo is small; avoid deep reads unless changing the area.

Core files:
- `package.json` - scripts and dependencies.
- `lib/data/drinks.seed.json` - static source data for brands, categories, drinks.
- `lib/data/drinks.ts` - drink types, data export, computed helpers, grouping.
- `lib/data/brands.ts` - brand metadata derived from seed.
- `lib/data/categories.ts` - category metadata derived from seed.
- `scripts/validate-drinks-data.mjs` - data integrity checks.
- `app/[locale]/getraenke/page.tsx` - drink listing route.
- `app/[locale]/getraenke/[drinkId]/page.tsx` - SEO detail route.
- `components/drink-explorer.tsx` - client-side filters, compare UI, cards.
- `app/globals.css` - Tailwind base and CSS variables.

Useful searches:
- Drink by id/name: `rg '"drink-id"|Drink Name' lib/data/drinks.seed.json`
- Computed sugar usage: `rg 'totalSugarGrams|sugarCubes|packageEnergyKcal'`
- SEO metadata/schema: `rg 'metadata|jsonLd|FAQ|structured' app lib components`
- Locale routes: quote paths containing brackets, e.g. `sed -n '1,160p' 'app/[locale]/getraenke/page.tsx'`
