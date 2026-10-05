# CLAUDE.md

Proteinhaltig.de: a German, SEO-driven database of protein products (Next.js 15 App Router, React 19, TypeScript, Tailwind). Rules for all agents live in `AGENTS.md`. Read `.agents/*.md` only when the task needs them.

## Commands

```bash
npm run validate:data      # data integrity (schema, refs, nutrition plausibility); VERBOSE=1 lists kcal warnings
npm run typecheck          # validate:data + tsc --noEmit
npm run lint               # ESLint (next/core-web-vitals + typescript)
npm run test               # Vitest unit tests (*.test.ts) + next.config redirect check
npm run build              # validate:data + next build
npm run seo:check          # needs a prior build; starts its own server on :3210
npm run product -- <term>  # compact product lookup (see "Token budget")
```

Run `typecheck`, `lint`, `test` and `build` after code or data changes, plus `seo:check` after changes to indexing, redirects, sitemap or metadata. CI (`.github/workflows/docker-publish.yml`) runs the same checks before it builds the Docker image.

## Architecture

**Data flow:** `lib/data/products.seed.json` → `lib/data/products.ts` → pages.
- The seed holds source data only: `packageSize` + `unit` (g/ml), optional `servingSize` (only if the source states it), `nutritionPer100`, `source`, `sourceUrl`, `verificationStatus`, `lastCheckedAt`. `validate:data` rejects any other field (no `faq`, `computed`).
- Derived values come from helpers in `products.ts`: `packageProtein`, `servingProtein`, `packageEnergyKcal`, `proteinPer100Kcal`, `proteinEnergyShare`, `sizeLabel`. Never recompute inline.
- `lib/data/brands.ts` and `categories.ts` derive their metadata from the seed.

**One page per product:** `lib/page-routing.ts`.
- Sizes of a product (same `brandId` + `name`) share one page: the size with the most impressions in `lib/data/search-console-pages.json` (export 2026-10-05). Other sizes redirect to it with `#groesse-<size>-<unit>`.
- `legacyProductRedirects` holds old product URLs; targets resolve through `productPageHref`, so every old URL takes exactly one hop.
- `middleware.ts` answers all product redirects from `lib/product-redirects.ts` (308) and sends the apex domain to `https://www.proteinhaltig.de`.
- Build internal product links with `productPageHref()` so they never point at a redirect.

**Indexing is allowlist-based:** `lib/seo-index.ts` reads `lib/data/indexed-products.json`.
- The baseline (2026-10-05) holds every product page that was indexable before; Search Console showed impressions for almost all of them, so there was no mass noindex.
- New products are `noindex, follow` until added in a wave (skill `seo-wave`). The same check drives robots meta and the sitemap.
- Brand pages (`/de/marken/<id>`), category pages (`/de/kategorien/<id>`) and tools (`/de/proteinbedarf-rechner`) are indexable only when listed in `searchIndexableBrandIds`, `searchIndexableCategoryIds` or `searchIndexablePaths` in `lib/seo-index.ts`.
- 404 pages output only `noindex` (no global `robots` in `app/layout.tsx`).

**Product page:** `app/[locale]/produkte/[productId]/page.tsx`.
- Answer sentence first, then the fact card: protein per serving (if the source states one), per package for single-serve products, otherwise per 100 g; bar to the 50 g reference intake.
- Context comes from data only: `lib/product-facts.ts` (category rank, density rank, brand rank, sizes, EU claim when it differs) and `lib/protein-context.ts` (EU 1924/2006 thresholds 12 %/20 % energy from protein, 50 g reference intake, DGE g/kg, higher-protein alternatives). A fact renders only when its inputs are complete.
- No generated FAQ or template paragraphs. Swap cards carry a `data-buy-slot` for a later, labelled purchase link.

**Design:** tokens in `app/globals.css` (terracotta `--accent` on espresso `--stage`, Space Grotesk via `--font-display`). Shared UI in `components/ui/` (`ui.module.css`, `protein-scatter.tsx`, `energy-split.tsx`, `product-table.tsx`, `home-search.tsx`); homepage in `components/home-page.tsx`, data in `lib/home-data.ts`. Keep it visibly different from zuckerhaltig.de.

**Consent:** Google Analytics loads only after consent (`components/cookie-consent.tsx`, footer „Cookie-Einstellungen“). Keep `app/[locale]/datenschutz/page.tsx` in sync when tracking changes.

## SEO context

Sister project zuckerhaltig.de dropped sitewide on 2026-07-27 (likely a spam update after mass templated pages and cross-links between sister sites) and recovered after most pages went noindex. Proteinhaltig.de did not drop; it grew to ~300 impressions/day (position ~9) by October 2026. To keep it that way:
- No generated filler text or FAQ at scale. Pages earn value through source-backed numbers and data-derived comparisons.
- No footer or sitewide links to sister projects. Do not copy zuckerhaltig's design pixel for pixel.
- New pages only in waves of at most 15–20 with demand in Search Console.
- The redesign playbook lives in `docs/redesign-playbook.md`.

## Project skills

`.claude/skills/`: `product-data` (edit or verify products), `seo-wave` (indexing changes), `verify` (checks, local server, screenshots).

## Token budget

- `lib/data/products.seed.json` is about 450 KB. Never Read it whole. Use `npm run product -- <term>`, `--full <id>`, `--brand <id>` or `--category <id>`, or a targeted `rg -n '"id": "…"'`.
- `lib/data/product-candidates.json` holds unverified candidates; ignore it unless adding products.
- Other large files: `components/product-explorer.tsx`, `components/product-comparison-tool.tsx`, minified CSS modules. Read them by line range after `rg -n`.
- Skip `node_modules/`, `.next/`, `package-lock.json` and `public/` media.

## Gotchas

- Do not rebuild while `next start` runs against the same `.next`; see the `verify` skill.
- Production URLs use `www.`. Search Console data mixes apex and www URLs.
