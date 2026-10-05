# Task Routing

Data changes:
- Use the `product-data` skill. Edit `lib/data/products.seed.json` with targeted reads only.
- Never invent nutrition values, package or serving sizes, source URLs, or checked dates.
- Package protein is `nutritionPer100.protein * packageSize / 100`; use the helpers in `lib/data/products.ts`.
- Run `npm run validate:data`; for code/data tasks also run typecheck, lint, test and build.

SEO/content:
- German first. The first sentence answers the search query.
- No generated FAQ or template paragraphs per page; facts come from data (`lib/product-facts.ts`).
- Indexing changes only via the `seo-wave` skill and after asking the user.
- Use `anti-ai-slop-writing` for German copy, metadata and article text.

UI:
- Noise to avoid: uppercase eyebrows, periods at the end of headings, slogans, "01/02/03" cards, badges that say the same everywhere, hedging sentences.
- Mobile first, no horizontal scroll, real tables for tabular data.
- Proteinhaltig must not look identical to zuckerhaltig.de (own accent colour, card shapes, main chart).

Architecture:
- Static JSON is acceptable now. Do not add SQLite for production.
