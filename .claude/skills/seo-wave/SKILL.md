---
name: seo-wave
description: Make more product, brand or category pages indexable, or change sitemap/robots/canonical/redirect behavior. Use when editing lib/data/indexed-products.json, lib/seo-index.ts, lib/page-routing.ts, app/sitemap.ts or page robots metadata.
---

# SEO indexing wave

Background: sister site zuckerhaltig.de lost almost all visibility on 2026-07-27 after mass templated pages and cross-links. Proteinhaltig.de kept growing. Indexing changes stay small and deliberate, and always need the user's OK first.

## Rules
- One wave is at most 15–20 new pages, with 2–3 weeks between waves.
- Only pages with Search Console demand (impressions on the URL or matching queries). Ask the user for a fresh export if none is at hand and refresh `lib/data/search-console-pages.json` from it.
- Only product pages (`isProductPage`) with complete, sourced data.
- Never remove or redirect a URL with impressions without a single 301/308 to a page that returns 200. `npm run seo:check` checks every product URL from the export.
- No generated paragraphs or FAQ to "fill" pages. No sitewide links to sister projects.

## Steps
1. Add the IDs to `ids` in `lib/data/indexed-products.json` and append an entry to `waves` (date, note, IDs).
2. `npm run test && npm run build && npm run seo:check`.
3. Spot-check one new page: robots meta is `index, follow`, canonical points to itself, the URL is in the sitemap.
4. Report the wave (IDs and date) so the next wave can be timed.
