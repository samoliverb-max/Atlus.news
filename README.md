# Atlus

Privacy-first, email-first personalised news. This repo is three separate apps plus the docs that tie them together. If you're lost, start here.

## Repo map — where everything is

| Path | What it is | Status |
|---|---|---|
| [`marketing-site/`](marketing-site/) | Public site (joinatlus.com) — landing page, manifesto, team. TanStack Start + React + Tailwind. | Built |
| [`frontend/onboarding-prototype.html`](frontend/onboarding-prototype.html) | The onboarding flow reader-facing UI. Vanilla HTML/JS, no build step. Now wired to the real API. | Built |
| [`frontend/iptc-explorer.html`](frontend/iptc-explorer.html) | Standalone browser for the ~1,400-node IPTC topic map, plus a "Vectors" tab for a reader's own graph. | Built |
| [`backend/`](backend/) | The API (Express + Postgres), the IPTC vocabulary loader, DB schema, scripts, tests. | Built: data layer, IPTC loader, resumable onboarding API. **Not built:** article ingestion, the daily recommender job, email send, the feedback endpoint, profile edit/erase. |
| [`CLAUDE.md`](CLAUDE.md) | The build brief — product spec, algorithm to preserve, hard constraints, build order. Claude Code reads this automatically. Lives at the repo root because Claude Code only auto-reads it from there. | Reference — still the spec, keep it current if scope changes |
| [`docs/`](docs/) | Everything else you'd need to understand a decision, but not to run the apps: | |
| &nbsp;&nbsp;[`docs/DATA-CONTRACT.md`](docs/DATA-CONTRACT.md) | The exact onboarding answer payload shapes and API endpoints. Source of truth for the frontend/backend interface. | Reference |
| &nbsp;&nbsp;[`docs/README-START-HERE.md`](docs/README-START-HERE.md) | The original pre-build handoff brief (how this repo was first given to Claude Code). The backend it describes is now built — kept for the origin story, not current status. | Historical |
| &nbsp;&nbsp;`docs/atlus-*.md`, `docs/STYLE-GUIDE.md` | Design specs: the nodal/IPTC/email architecture, cold-start reasoning, full node breakdown, visual style guide. | Reference |
| [`Dockerfile`](Dockerfile) | Builds `backend/` + `frontend/` together for deploy. | Reference |

**tl;dr:** three apps (`marketing-site/`, `frontend/`, `backend/`), one spec at the root (`CLAUDE.md`) because the tooling requires it there, everything else explanatory in `docs/`.

## Run everything locally

No database needed to just *look* at the front ends:

```bash
# marketing site — http://localhost:8080
cd marketing-site && bun install && bun run dev

# onboarding prototype + topic explorer — http://localhost:5500
python3 -m http.server 5500 --directory frontend
```

Served this way, the onboarding prototype falls back to in-memory state — fine for looking at the UI, but nothing is saved. To exercise it against the real API:

```bash
cd backend
npm install                       # or: bun install
cp ../.env.example .env           # then set DATABASE_URL
createdb atlus                    # or whatever DATABASE_URL points at

npm run migrate                   # applies backend/schema.sql
npm run load-iptc                 # fetches the live IPTC vocabulary (~1,400 nodes)
npm run seed-sources               # seeds outlet/platform fingerprints for the Sources step

npm run dev                       # API on :4000
```

`server.ts` also serves `frontend/` itself at `:4000` — same origin, no CORS/`API_BASE` config needed. That's the one link to share once deployed. (Opening the HTML file directly via `file://` still works too — it falls back to `http://localhost:4000` automatically.)

All three have a ready-made dev config in [`.claude/launch.json`](.claude/launch.json) if you're driving this from Claude Code's browser preview.

## Running the tests

```bash
cd backend && bun test
```

No external Postgres needed — `test/e2e.test.ts` boots a real Postgres in-process (`@electric-sql/pglite`), runs the actual migration, IPTC loader, and source seeding, then drives the full onboarding flow through genuine HTTP requests. It does a live fetch to `cv.iptc.org`, so it needs network access.

## Deploying

```bash
docker build -t atlus-onboarding .    # from the repo root — build context needs both backend/ and frontend/
```

Works on Render, Fly.io, Railway, or whatever host is arranged. Give it `DATABASE_URL` (a real Postgres) and optionally `PORT`. One-time setup against that database, before or right after first deploy:

```bash
docker run --rm -e DATABASE_URL=... atlus-onboarding bun run scripts/migrate.ts
docker run --rm -e DATABASE_URL=... atlus-onboarding bun run scripts/load-iptc.ts
docker run --rm -e DATABASE_URL=... atlus-onboarding bun run scripts/seed-sources.ts
```

Most PaaS hosts also let you run these as a one-off exec against the deployed container instead. After that, the deployed URL is the whole thing: onboarding UI at `/`, API alongside it.

`npm run load-iptc` is idempotent — safe to re-run any time (e.g. yearly, per `CLAUDE.md`) to pick up vocabulary changes. It upserts `topics` and `topic_edges` only.

## A note on qcodes

`backend/src/sources.ts` and the curated topic subset in the onboarding chip UI both had to be re-pointed at real IPTC qcodes — the original prototype used short illustrative codes (`medtop:ai`, `medtop:macro`, …) for its ~40-node demo graph, which don't exist in the real ~1,400-node vocabulary. `SYNTHETIC_TO_REAL` in `sources.ts` documents the mapping. The onboarding chips still show only a curated subset for a clean first-run UX, but every qcode they send is a real, valid IPTC node the backend's full graph recognizes.
