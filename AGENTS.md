# AGENTS.md

Proteinhaltig.de is a German SEO-focused protein product database built with Next.js App Router, React, TypeScript, and Tailwind.

Start with:
- `.agents/project-map.md` for orientation
- `.agents/commands.md` for verification
- `.agents/task-routing.md` for task-specific rules
- `.agents/handoff.md` before handing work back

Hard rules:
- Keep responses and UI copy short, clear, and German-first.
- Never invent verified nutrition values or sources.
- Treat MVP demo values as unverified until checked against packaging or manufacturer pages.
- Use helpers from `lib/data/drinks.ts` for package protein, protein portions, and kcal.
- Validate product data after changing `lib/data/drinks.seed.json`.
- Do not overwrite user changes. Commit only when asked.

Avoid during orientation:
- `node_modules/`, `.next/`, `dist/`, `build/`, `.git/`, coverage, lockfiles, generated/minified files, large media, old exports.
- Broad reads when `rg --files` or targeted `rg` is enough.
