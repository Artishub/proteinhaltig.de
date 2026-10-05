# AGENTS.md

Proteinhaltig.de is a German SEO-focused protein product database built with Next.js App Router, React, TypeScript, and Tailwind. `CLAUDE.md` has the architecture, commands and SEO context.

Start with:
- `.agents/project-map.md` for orientation
- `.agents/commands.md` for verification
- `.agents/task-routing.md` for task-specific rules
- `.agents/handoff.md` before handing work back

Hard rules:
- Never spawn subagents unless the user explicitly requests them; default to `fork_turns="none"` when requested.
- Keep responses and UI copy short, clear, and German-first.
- Never invent nutrition values, serving sizes or sources. Every number needs a source, a check date and a status.
- Use helpers from `lib/data/products.ts` for package protein, serving protein, kcal and energy share.
- Validate product data after changing `lib/data/products.seed.json`.
- Do not change indexing (robots, sitemap, `lib/data/indexed-products.json`) without asking the user.
- No generated FAQ or template paragraphs on product pages. No sitewide links to sister projects.
- Do not overwrite user changes. Commit only when asked.

Avoid during orientation:
- `node_modules/`, `.next/`, `dist/`, `build/`, `.git/`, coverage, lockfiles, generated/minified files, large media, old exports.
- Broad reads when `rg --files` or targeted `rg` is enough.
