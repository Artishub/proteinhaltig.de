---
name: verify
description: Verify code, data or UI changes in this repo - typecheck, lint, tests, build, SEO smoke test, local server and screenshots. Use before reporting work as done or when asked to check the site.
---

# Verify changes

## Checks
- Code or data: `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`.
- Indexing, redirects, sitemap or metadata: also `npm run seo:check` (needs the build, starts its own server on :3210, checks every product URL from the Search Console export).

## Local server
- Never rebuild while `next start` runs on the same `.next`; it serves stale pages with broken CSS.
- Stop the server by PID. `pkill -f next` also matches your own shell.

```bash
ps aux | grep '[n]ext-server'   # find the PID, then kill <pid>
rm -rf .next && npm run build
npx next start -p 3100 -H 127.0.0.1   # run in background
```

## Screenshots (token cost)
- Use the in-app browser. Screenshot sections or the viewport at reduced scale, not full pages.
- Check mobile (375×812) and desktop, light and dark (theme toggle stores `theme` in localStorage).
- Dismiss the cookie banner first (it covers the lower part of the viewport).
