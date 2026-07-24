# CLAUDE.md — Atlus Onboarding Build Brief

You are building the production onboarding system for **Atlus**, a privacy-first, email-first personalised news product. A working reference UI already exists in `frontend/onboarding-prototype.html`. Your job is to build the backend it deserves and wire the frontend to it. Read `DATA-CONTRACT.md` before writing any code — it is the source of truth for the data shapes.

## Product in one paragraph

Atlus emails each reader a small, deliberately chosen set of articles per day (Light 1 / Standard 3 / Deep 5). Personalisation runs on the **IPTC Media Topics** taxonomy (~1,200 topic nodes, a published SKOS graph). Each reader has a private weighted copy of that graph, split into three vectors: **Preference** (what they enjoy → Core articles), **Goal** (what they want to understand → Stretch articles), **Knowledge** (what they already know → sets sophistication and bounds Discovery). Articles are tagged onto the same nodes, so recommendation is graph proximity. All data is volunteered by the reader; nothing is tracked behaviourally.

## What already works (in the prototype)

`frontend/onboarding-prototype.html` is a complete, tested reference implementation of the onboarding logic in vanilla JS. It holds the algorithm you must preserve:

- **Spreading activation** (`spread()`): a weight on a node leaks to neighbours (parent 0.45, child 0.35, related 0.40, sibling 0.15). This is how ~20 answers populate a 1,200-node profile.
- **Recommender** (`recommend()`): Core = 0 hops from a high-Preference node; Stretch = 1–2 hops, steered toward Goal nodes, preferring cross-branch `related` edges; Discovery = 3+ hops, bounded by the reader's reach setting. Geography and political-lens modifiers adjust scores.
- **Vector commits**: each onboarding step calls a commit function that writes weights (`stepTopics`, `stepSources`, `stepGoals`, etc.).

Treat this JS as the executable spec for the algorithm. Port it faithfully to the backend; do not redesign it.

## What to build

1. **Database** — run `backend/schema.sql`. Tables: `topics`, `topic_edges`, `article_topics`, `users`, `user_topic_weights`, `user_config`, `user_political`, `user_geo`, `user_demographics`, `user_read_history`, `onboarding_progress`.
2. **IPTC loader** — ingest the official vocabulary (live from `https://cv.iptc.org/newscodes/mediatopic?format=json&lang=en-GB`, CC-BY 4.0) into `topics` + `topic_edges`. Tag edges with provenance (`iptc-tree`, `iptc-related`). Refresh yearly.
3. **Onboarding API** — save answers **per step** so the flow is resumable (see `DATA-CONTRACT.md` for the per-step payloads and endpoints). Server-side spreading activation writes the resulting weights into `user_topic_weights`. Resume via a magic-link token, since the product is email-first.
4. **Ingestion + tagging** — pull article metadata from RSS/APIs; tag onto IPTC nodes (publisher codes first, then the open `classla/multilingual-IPTC-news-topic-classifier`, then embedding/LLM for finer nodes). Metadata only — never warehouse full article text (UK CDPA constraint; see docs).
5. **Daily recommender job** — per reader, run the ported `recommend()` against `article_topics`, fill the reading-mode quota, attach the explanation string, send the email.
6. **Feedback endpoint** — signed one-tap URLs in each email (`more`/`less`/`basic`/`further`) update `user_topic_weights` on the article's exact nodes. This is the ongoing email-native profiling loop.
7. **Wire the frontend** — replace the in-memory `S` object with `fetch()` calls to the save-answer endpoints. Keep the UI and interaction identical.

## Hard constraints (do not violate)

- **IPTC is the only taxonomy.** Reader interests and article tags share these QCodes. No parallel category system.
- **Volunteered data only.** No pixels, no behavioural tracking, no silent inference of ethnicity/politics/orientation.
- **Special-category data gated.** Political opinion and sensitive demographics (ethnicity, religion, orientation) require explicit opt-in consent stored with a timestamp (UK GDPR Art. 9). Every such field must support "prefer not to say" and be independently deletable.
- **Metadata-only ingestion.** Classify from titles/descriptions/OpenGraph; analyse-and-discard any full text; never store or surface article body text.
- **Everything editable.** A reader can view, change, or erase any stored value. Build the profile read/edit endpoints alongside the write path.

## Suggested build order

Data layer → IPTC loader → save-answers API (resumable) → wire prototype to it → ingestion + tagging → recommender job → email send → feedback endpoint → profile edit/erase. Ship each stage working before the next.

## Stack notes

No stack is mandated. A pragmatic default: Postgres, a typed API (FastAPI or Node/TypeScript), the classifier via a small Python worker. Free hosting/email is already arranged. Confirm choices with the team before scaffolding.

## Deeper context

`docs/` holds the full design specs: the nodal/IPTC/email architecture, the cold-start reasoning, and the complete node breakdown. Read them if a decision needs justifying.
