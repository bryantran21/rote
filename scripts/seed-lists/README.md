# Curated seed lists

Committed slug lists for the curated problem sets, cross-referenced by
`scripts/build-catalog.ts` to set each problem's `lists` field.

- `neetcode150.txt` — NeetCode 150 roadmap
- `blind75.txt` — Blind 75
- `grind75.txt` — Grind 75

**These `.txt` files are generated from the `SEED` array in
`../build-catalog.ts`, which is the committed source of truth** (it carries the
per-problem metadata: title, difficulty, tags, app-topic grouping, list
membership, paid flag). They're kept here as a human-readable cross-reference
and as the fallback slug source described in the build script.

Everything here is **metadata only** — titles, difficulty, tags, and canonical
URLs. No problem statements, examples, or test cases are ever stored. To refresh
the catalog, edit `SEED` (or add slugs) and run `npm run build-catalog`.
