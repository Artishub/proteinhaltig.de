# PLANS.md

Living project plan for Proteinhaltig.de.

## Current State

- Static Next.js site with German routes under `/de`.
- Protein product MVP data in `lib/data/drinks.seed.json`.
- Generated detail pages under `/de/produkte/[productId]`.
- Filters for brand, category, pack size, low-protein exclusion, protein limits, search, sorting, comparison, and pagination.
- Wissen and FAQ pages contain protein-product educational content.
- Data validation checks IDs, references, and nutrition protein alignment.

## Near-Term Priorities

1. Data quality
   - Replace MVP demo values with verified label or manufacturer values.
   - Add `sourceUrl` and keep `lastCheckedAt` current.
   - Prefer manufacturer sources over shops when both exist.

2. Product detail pages
   - Improve explanatory text once verified values are available.
   - Add stronger internal links to brand, category, and comparable products.
   - Add JSON-LD beyond FAQ where appropriate.

3. Search and filters
   - Keep global search working from every route.
   - Make URL params the source of truth for all filter state.
   - Review variant grouping behavior for edge cases.

4. SEO content
   - Expand Wissen articles around protein bars, protein yogurt, skyr, pudding, drinks, powder, and plant protein.
   - Add comparison pages for important brands and categories.
   - Keep health claims careful and non-prescriptive.

## Non-Goals For Now

- No brand logos unless usage rights are clear.
- No medical advice.
- No user accounts.
- No heavy client-side state framework unless the filter/search surface outgrows local React state.
