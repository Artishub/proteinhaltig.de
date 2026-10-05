# Commands

Run from repo root.

- Dev: `npm run dev`
- Data: `npm run validate:data` (`VERBOSE=1` lists kcal warnings)
- Typecheck: `npm run typecheck`
- Lint: `npm run lint`
- Tests: `npm run test`
- Build: `npm run build`
- SEO smoke test after a build: `npm run seo:check`
- Product lookup: `npm run product -- <term>`

Before finishing code or data edits run typecheck, lint, test and build; add `seo:check` for indexing, redirect, sitemap or metadata changes.
