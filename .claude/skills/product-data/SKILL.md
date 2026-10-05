---
name: product-data
description: Add, correct or verify products in lib/data/products.seed.json (nutrition values, package and serving sizes, sources, verification status). Use for any change to product, brand or category data.
---

# Product data

## Find before editing
- Never read `lib/data/products.seed.json` whole (~450 KB).
- `npm run product -- <term>` gives one line per match. `--full <id>` shows one record, `--brand <id>` and `--category <id>` filter.
- Edit with a targeted `rg -n '"id": "<id>"' lib/data/products.seed.json` and a line-range read.

## Source rules
- Never invent values. `nutritionPer100`, `packageSize`, `servingSize`, `sourceUrl` and `lastCheckedAt` must come from a source the user gave or you opened.
- Prefer the German manufacturer page over a retailer, a retailer over a nutrition database. Status: `manufacturer_verified`, `retailer_verified` or `nutrition_database_verified`.
- `servingSize` only when the source names a serving (e.g. "pro Portion (30 g)"). Leave it out otherwise.
- Values per 100 g for solids, per 100 ml for drinks (`unit`). Convert per-serving tables to 100 g/ml and say so in `note`.
- Store source data only. No `computed`, `faq` or derived values; `validate:data` rejects unknown fields.
- A new brand or category needs an entry in `brands` / `categories` in the same file.
- Sizes of one product share `name` + `brandId`; they get one page (`lib/page-routing.ts`).

## Indexing
- New products are `noindex, follow` until added to `lib/data/indexed-products.json` (skill `seo-wave`).

## Done when
- `npm run validate:data` passes (check `VERBOSE=1` for kcal warnings on the products you touched), then `npm run typecheck` and `npm run test`.
