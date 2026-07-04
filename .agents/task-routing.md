# Task Routing

Data changes:
- Edit `lib/data/drinks.seed.json`.
- Never invent nutrition values, package sizes, source URLs, or checked dates.
- If source text states package sugar, data must match calculated package sugar.
- Total sugar is `sugarPer100Ml * sizeMl / 100`; sugar cubes use 3 g.
- Prefer `totalSugarGrams`, `sugarCubes`, and `packageEnergyKcal` from `lib/data/drinks.ts`.
- Run `npm run validate:data`; for code/data tasks also run typecheck and build.

SEO/content:
- German first. Keep wording direct and search-intent based.
- Detail pages need concrete values, source context, FAQ, similar drinks, and structured data.
- Use `anti-ai-slop-writing` for German SEO copy, FAQ, metadata, and article text.

UI:
- Keep the design quiet, modern, SaaS-like, and bright in default light mode.
- Use subtle grey page surfaces, compact mobile cards, and no horizontal mobile scroll.
- Mobile navigation should be a menu, not a scroll row.
- Use lucide icons where useful.
- Do not use brand logo images unless legal usage is confirmed.
- Use `design-taste-frontend` for explorer UI, drink cards, detail pages, or responsive layout work.
- Use `caveman` only when the user asks for compressed/final-summary style.

Architecture:
- Static JSON is acceptable now.
- Future source of truth should be Postgres with import/admin validation and source history.
- Do not add SQLite for production.
