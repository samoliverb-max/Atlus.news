# Atlus onboarding — built

This is the working onboarding backend for `CLAUDE.md`'s build brief, stages 1–4: data layer, IPTC loader, resumable onboarding API, and the prototype wired to real `fetch()` calls. See `CLAUDE.md` for what's deliberately **not** built yet (article ingestion, the daily recommender job, email send, the feedback endpoint, post-onboarding profile edit/erase).

## What's here

```
backend/
  schema.sql          the Postgres schema
  src/                the API (Express + pg), graph engine, weight persistence
  scripts/            migrate.ts, load-iptc.ts, seed-sources.ts
  test/e2e.test.ts    full flow test against an ephemeral in-process Postgres — no setup needed
frontend/
  onboarding-prototype.html   the reference UI, wired to the real API
  iptc-explorer.html          full topic-map browser (unchanged, not wired)
```

## Run it for real

You need Node 18+ (or Bun) and a Postgres database — a local install, Docker, or whatever hosting is already arranged.

```bash
cd backend
npm install        # or: bun install
cp ../.env.example .env
# edit .env: set DATABASE_URL to your Postgres connection string
createdb atlus      # or whatever database name your DATABASE_URL points at

npm run migrate       # applies schema.sql
npm run load-iptc     # fetches the live IPTC Media Topic vocabulary (~1,400 nodes) and loads it
npm run seed-sources  # seeds the outlet/platform fingerprints used by the sources step

npm run dev            # starts the API on :4000 (PORT / DATABASE_URL from .env)
```

Then open `frontend/onboarding-prototype.html` in a browser. It talks to `http://localhost:4000` by default — change the `API_BASE` constant near the top of its `<script>` if your API runs elsewhere. The API sends permissive CORS headers, so opening the HTML file directly (`file://`) or serving it from any static host both work.

## Running the tests

```bash
cd backend
bun test
```

No external Postgres needed — `test/e2e.test.ts` boots a real wire-protocol-compatible Postgres in-process (`@electric-sql/pglite` + `pglite-socket`), runs the actual migration, IPTC loader (a live fetch), and source seeding against it, then drives the full 15-step onboarding flow through genuine HTTP requests against the real Express app. It also does a live fetch to `cv.iptc.org`, so it needs network access.

## Re-running the IPTC loader

`npm run load-iptc` is idempotent — safe to re-run any time (e.g. yearly, per CLAUDE.md) to pick up vocabulary changes. It upserts `topics` and `topic_edges`; nothing else touches those tables.

One thing worth knowing: the live IPTC feed has no `related`-type SKOS links at all, so only `iptc-tree` edges get loaded. Cross-branch `related` edges (used by the recommender's Stretch category) are a later addition — see `topic_edges.provenance` in the schema, which already has a slot for `co-occurrence`/`wikidata`-derived edges once that exists.

## A note on qcodes

`backend/src/sources.ts` and the curated topic subset in `onboarding-prototype.html`'s chip UI both had to be re-pointed at real IPTC qcodes — the original prototype used short illustrative codes (`medtop:ai`, `medtop:macro`, …) for its ~40-node demo graph, which don't exist in the real ~1,400-node vocabulary. `SYNTHETIC_TO_REAL` in `sources.ts` documents the mapping (found by searching the live feed for the closest real match to each label). The onboarding chips still only show a curated subset for a clean first-run UX, but every qcode they send is a real, valid IPTC node the backend's full graph recognizes.
