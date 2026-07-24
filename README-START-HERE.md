# Atlus Onboarding — Handoff to Claude Code

This folder is a self-contained brief for building the real onboarding system. Hand the whole folder to Claude Code and it has everything it needs: a working reference UI, a build brief it reads automatically, a data contract, and a database schema.

## What's in here

```
atlus-handoff/
├─ README-START-HERE.md      ← you are here
├─ CLAUDE.md                 ← the build brief Claude Code reads automatically
├─ DATA-CONTRACT.md          ← the exact answer payload + API endpoints (the important one)
├─ backend/
│  └─ schema.sql             ← the database tables, ready to run
├─ frontend/
│  ├─ onboarding-prototype.html   ← the working reference UI (all logic lives here)
│  └─ iptc-explorer.html          ← the full ~1,200-node topic explorer
└─ docs/                     ← the design specs behind all of it
```

## How to do the handoff (three steps)

**1. Put this folder under version control.**
Open a terminal in this folder and run:
```
git init && git add . && git commit -m "Atlus onboarding: prototype + build brief"
```
(Or drop it into a new GitHub repo — whatever Henry prefers.)

**2. Open it in Claude Code.**
In the same folder:
```
claude
```
Claude Code automatically reads `CLAUDE.md`, so it starts with the full picture.

**3. Give it the first instruction.**
Something like:
> Read CLAUDE.md and DATA-CONTRACT.md. Build the backend described there: the database from backend/schema.sql, an API that saves onboarding answers per step (resumable), the IPTC ingestion, and the daily recommender. Wire the prototype in frontend/ to POST real answers instead of holding them in memory. Start with the data layer and the save-answers endpoint, and show me a plan before writing code.

That's it. Claude Code builds against the contract, and because the contract defines the answer shape precisely, the answers feed the backend correctly the moment it exists.

## The one idea that makes this work

The prototype already produces exactly the data the backend needs: a set of weighted IPTC topic nodes per reader, split into Preference / Goal / Knowledge, plus political, geographic and demographic fields. `DATA-CONTRACT.md` freezes that shape. So the frontend and backend are built against the same contract and meet in the middle — the answers flow in without rework.

## What Claude Code should NOT change

- The IPTC vocabulary is the shared language between reader and article. Do not invent a parallel taxonomy.
- Volunteered data only. No behavioural tracking, no silent inference of special-category data.
- Political and sensitive-demographic data stay behind explicit consent (UK GDPR Article 9).
