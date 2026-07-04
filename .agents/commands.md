# Commands

Run from repo root.

- Dev: `npm run dev`
- Data validation: `npm run validate:data`
- Typecheck: `npm run typecheck`
- Build: `npm run build`

Notes:
- `typecheck` and `build` both run `validate:data`.
- No lint or test script exists unless `package.json` changes.
- Before finishing code or data edits, run:

```bash
npm run typecheck
npm run build
```

If local dev shows stale Next chunk/runtime errors after a build:

```bash
lsof -tiTCP:3000 -sTCP:LISTEN | xargs -r kill
npm run dev -- --hostname 127.0.0.1 --port 3000
```
