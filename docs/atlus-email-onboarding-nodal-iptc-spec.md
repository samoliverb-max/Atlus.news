# Atlus — Email-First Onboarding Feeding a Nodal Preferencing System on IPTC

**Purpose:** the full working spec for launch. Three parts: (1) how the IPTC graph works as a node network, in plain terms; (2) how the nodal preferencing system runs on it, including using IPTC's adjacency links to generate Stretch articles; (3) how the long, volunteered-data onboarding and the daily email feed and maintain that node network. Written to hand to Henry.

---

# Part 1 — The IPTC graph, explained simply

## What it is

IPTC Media Topics is not just a list of categories. It is a **graph**: roughly 1,200 topics (nodes) joined by typed links (edges), published in SKOS, a standard machine-readable format. There are three kinds of edge, and each one matters to Atlus differently.

**1. Parent–child links (`broader` / `narrower`).** The backbone. Seventeen top-level topics, each opening downward through up to five levels. "Economy, business and finance" contains "macroeconomics", which contains "inflation". Think of it as a family tree: every node knows its parent and its children.

**2. Cross-branch links (`related`).** Sideways edges joining topics in *different* branches that belong together in the real world. "Energy policy" (politics branch) relates to "energy and resources" (economy branch). These are sparser than the tree links but they are the interesting ones, because they encode editorial judgement about which subjects genuinely touch, made by news-industry taxonomists over years. This is knowledge you could not cheaply build yourselves.

**3. Wikidata mappings.** Every topic points at its Wikidata entity, and Wikidata is itself a giant graph. Where IPTC's own sideways links are thin, you can walk out through Wikidata to find that two topics share strong real-world connections. This is the augmentation layer, not needed at launch, available when you want it.

## Adjacency, in one sentence

Two topics are **adjacent** when they are one edge apart, siblings under the same parent, a parent and child, or a `related` pair across branches, and the number of edges you must walk between any two topics gives you a natural, tunable **distance measure** across all of news.

That distance measure is the thing to appreciate. "Close to what you read" and "far from what you read" stop being vibes and become countable hops on a published industry-standard graph.

---

# Part 2 — The nodal preferencing system

## The model

Picture the IPTC graph laid flat, with every reader owning a private copy where each node carries three numbers, the three vectors from the brief:

- **P (preference)** — how much the reader enjoys this topic
- **G (goal)** — how much the reader wants to grow into this topic
- **K (knowledge)** — how well the reader already understands it

Articles are ingested and tagged onto the same nodes (publisher-supplied IPTC codes first, the open multilingual IPTC classifier second, embedding/LLM matching for finer nodes). So every article is a small set of lit-up nodes, and every reader is a weighted heat-map over the identical graph. Recommendation is the overlap between the two.

## Activation spreading — why "nodal" is the right word

When a reader's node gets weight, a fraction of it leaks along the edges to neighbours: strong interest in "artificial intelligence" implies mild presumptive interest in its siblings ("computing", "scientific research") and its `related` partners. This is classic spreading activation, and it is what makes a sparse volunteered profile behave like a rich one. Twenty answered nodes, spread through the graph, produce a usable weight everywhere that matters — without tracking anything.

Decay matters too: weights fade slowly unless refreshed by new volunteered signals, so the profile stays current without surveillance.

## The three categories as graph operations

**Core = overlap.** Articles whose nodes sit directly on high-P nodes. Zero hops. "You read this because it is squarely inside your stated interests."

**Stretch = adjacency. This is your question, and the answer is yes.** Stretch articles come from nodes that are *edges away from* the reader's high-P nodes, reachable but not occupied, with two qualifying conditions:

1. **Distance band.** Candidate nodes sit 1–2 hops from a high-P node: siblings, parents' other children, and above all `related` cross-branch partners. The `related` edges are the premium Stretch source, because a sibling is more of the same shelf, while a cross-branch partner is a genuinely different lens on a subject the reader already cares about. A markets reader stretched to "energy policy" via the economy→politics related-link learns something structurally new yet immediately relevant.
2. **Direction.** Where the reader stated goals, Stretch walks preferentially along paths from high-P nodes *toward* high-G nodes. The goal vector chooses which adjacent doors to open; adjacency guarantees every step stays within reach. A reader who loves tech (P) and wants to grasp economics (G) gets stretched through the connecting nodes: "technology and innovation policy", "digital economy". Where no goals were given, pure adjacency-weighted exploration substitutes until goals arrive.

The K vector tunes pitch: high K near the target node permits sophisticated pieces, low K selects entry points. And the explanation writes itself from the edge walked: "You follow AI closely; this piece on chip-industry economics borders it."

**Discovery = far hops.** Nodes 3+ hops out, beyond the adjacency band, bounded by the reader's discovery-reach setting and their excluded nodes. Same machinery, longer walk.

One honest engineering note: IPTC's `related` edges are valuable but sparse — they do not exist between every pair that "feels" adjacent. The build should treat them as the first-class Stretch edges where present, fall back to sibling/parent hops where absent, and later densify the sideways graph using the Wikidata mappings or co-occurrence of topics in ingested articles. Design the edge table so an edge's *provenance* (iptc-tree, iptc-related, wikidata, co-occurrence) is stored, so you can weight edge types differently as you learn which ones produce Stretch articles readers actually open.

## Minimal data model

```
topics(qcode PK, label, level, parent_qcode, wikidata_id)
topic_edges(from_qcode, to_qcode, edge_type, weight)        -- tree + related + augmented
article_topics(article_id, qcode, confidence, source)
user_topic_weights(user_id, qcode, vector {P,G,K}, weight, source, updated_at)
user_config(user_id, discovery_reach, excluded_qcodes, volume, cadence, send_time)
user_history(user_id, article_id, qcode, sent_at, feedback)
```

Daily job per reader: score candidates as Core (overlap with P), Stretch (1–2 hop walk from P toward G, K-pitched), Discovery (3+ hops within reach), fill the Light/Standard/Deep quota, attach the explanation string derived from the walk, send the email.

---

# Part 3 — Onboarding and the email loop that feed the graph

Atlus runs on volunteered data only. Every weight in the node network above must come from something the reader deliberately told you. That has two consequences: onboarding must be long enough to light up a real profile, and the daily email must keep collecting declarations forever after. Deliberately long is correct here — with one protection.

## 3.1 The signup questionnaire (long, resumable, web)

A hosted form at joinatlus.com (custom page, or Typeform/Tally wired to the backend for speed). One question per screen, progress bar, and **every answer saved as it is given** — if the reader stops, a magic link by email resumes them exactly where they left off. Resumability is the single guardrail that makes "too long rather than too short" safe: length then costs patience, never data.

Question stages, each annotated with the node-network write it performs:

| Stage | Reader does | Graph write |
|---|---|---|
| 1. Topics | Taps interests from the 17 top-level topics (friendly labels over canonical QCodes), min. 3 | P weight on chosen top-level nodes; activation spreads to children |
| 2. Depth | For each chosen topic, taps second-level children | P weight moves down to precise nodes; unpicked siblings mildly damped |
| 3. Sources | Selects publications/Substacks already read | Each source's own classified topic distribution adds P *and* K weight on its nodes |
| 4. Goals | Free text: "what do you want to understand better?", LLM-parsed | G weight on mapped nodes, with intent flag (deepen vs diverge) — this sets Stretch direction |
| 5. Knowledge | Per chosen topic: new to this / casual / read closely | K weight per node; sets sophistication floor |
| 6. Reach & exclusions | Discovery slider + "anything to keep out?" | Hop-limit config; zeroed excluded nodes |
| 7. Delivery | Light/Standard/Deep, send time, cadence | Config only |
| 8. Read-back | Sees the assembled profile in plain language, edits anything | Corrections overwrite weights; trust promise made visible |

Because the graph spreads activation, even a reader who abandons after stage 1 has a working (if blunt) profile, and the resume link recovers the rest. Completion of stage 8 can carry a small reward with real pull: "your first issue arrives tomorrow at 7am."

## 3.2 The daily email as permanent onboarding

Every article in the issue sits on known nodes, so feedback buttons become precise volunteered graph-writes, not tracking:

- **More like this / less like this** → ±P on that article's nodes
- **Too basic / about right / too advanced** → K calibration on those nodes
- **"Stretch further" on a Stretch pick** → +G along that edge direction; its opposite retracts the walk
- **Occasional one-tap micro-question** (at most one per issue, chosen by active learning as the current most informative node): "Interested in development economics? Yes / No / Ask later"

Each tap hits a lightweight endpoint keyed to the reader and QCode and updates `user_topic_weights` directly. Ten seconds of taps a day outperforms weeks of passive click-tracking in signal quality, because every datum is a declaration — which is the brand.

The profile page (a simple authed web page, well short of a full app) shows the current node weights in plain language, lets the reader edit anything or chat with the LLM to adjust, and restates the promise: never sold, only ever used to pick your articles, delete anytime.

## 3.3 Launch stack, spelled out

1. **Form**: custom one-question-per-screen page or Typeform/Tally → webhook
2. **Store**: one small database (the six tables above); answers land in `user_topic_weights` at submit-time per the stage table
3. **Graph load**: IPTC SKOS files ingested once into `topics` + `topic_edges` (tree and related edges, provenance-tagged); yearly refresh
4. **Ingestion**: RSS/API metadata → classifier → `article_topics`
5. **Daily job**: per-reader Core/Stretch/Discovery walk → templated email via the arranged email service
6. **Feedback endpoint**: signed one-tap URLs in each email → weight updates
7. **Profile page**: read-back + edit + magic-link auth

Nothing here requires the full web app. Every piece is launch-sized, and every later product surface (app, LLM chat) reads and writes the same node network, so nothing is thrown away.

---

## The one-paragraph version

IPTC gives Atlus a ready-made map of the news world: 1,200 topics joined by parent–child and cross-subject links, so closeness between any two subjects is a countable number of hops. Each reader owns a private weighted copy of that map, lit up only by what they have deliberately told us, at signup through a long, resumable questionnaire, and daily through one-tap declarations in the email itself. Core articles sit on the nodes a reader lit; Stretch articles come from the adjacent nodes one or two links away, steered toward stated goals, with IPTC's own cross-branch links doing the connective work; Discovery ventures further out, as far as the reader allows. The map is the industry's, the lights are the reader's, and nobody is ever watched.
