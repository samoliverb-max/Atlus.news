# Atlus — Building Onboarding to Feed the IPTC Classification System

**Purpose:** a build spec for how the onboarding flow writes directly into the IPTC Media Topics classification layer and the three-vector recommendation model, so that a reader's first answers and an article's tags live in one shared coordinate system.

**Reading order for Henry:** this doc assumes the topic model from the earlier integration note (a `topics` table holding the IPTC tree, `article_topics` holding article-to-topic tags, and `user_topic_weights` holding reader-to-topic weights split by vector). This spec fills in the reader side.

---

## 1. The central design decision

**Onboarding collects preferences in the exact vocabulary the classifier already speaks.**

The IPTC Media Topics top level is a set of 17 standard, mutually exhaustive categories with published definitions. Articles get tagged into those same 17 (and their descendants) on ingestion. If the onboarding chips are the 17 top-level topics rather than a hand-invented list, then a reader's selection and an article's classification are the same QCodes on day one, and no mapping table sits between them. That removes the single most common failure point in a recommendation cold start, where user-facing interests and machine-facing tags drift apart.

This also solves an old Atlus action item cleanly. The Step 1 taxonomy stops being arbitrary and becomes a recognised industry standard, updated yearly by IPTC, mapped to Wikidata, and shared across the international sources you already listed.

### The 17 top-level topics (verbatim IPTC labels)

Education · Human interest · Society · Sport · Crime, law and justice · Disaster, accident and emergency incident · Arts, culture, entertainment and media · Politics · Economy, business and finance · Lifestyle and leisure · Science and technology · Health · Labour · Religion · Weather · Environment · Conflict, war and peace.

Some of these read as newsroom desks rather than reader interests (Weather, Labour). The onboarding layer can present a curated subset or friendlier labels while storing the canonical QCode underneath, so the reader sees "AI and science" and the system stores `medtop:13000000` (science and technology).

---

## 2. What the research says onboarding should do

Four evidence-based constraints shaped the flow below.

**Choice beats rating.** Choice-based interfaces (tap to select) demand less effort and produce more satisfying recommendations than rating-based ones (stars, sliders on every item). Atlus onboarding should be mostly tapping.

**Short or abandoned.** Preference elicitation trades comprehensiveness against retention. Ask too much and readers skip or quit. The flow must yield a usable profile from a two-minute minimum path, then refine later.

**Active learning, not exhaustion.** Rather than quizzing the reader across all ~1,200 topics, ask only for the most informative signals, then let the model infer the rest and sharpen through early feedback. This is how the profile deepens without a longer form.

**Warm start, then learn.** Yahoo and Artifact ask for five or more topics up front and turn them into feed sections. Google News asks almost nothing and learns implicitly. Atlus should sit between the two: enough explicit input to deliver a good first day, and implicit learning thereafter, consistent with your privacy stance that the reader can see and edit every assumption.

---

## 3. The onboarding flow, mapped to writes into the data model

Each step below states what the reader does and the exact rows it writes into `user_topic_weights` (columns: `user_id`, `qcode`, `vector` in {preference, goal, knowledge}, `weight` 0 to 1, `source`, `updated_at`).

### Step 1 — Pick your topics `→ preference`

Reader taps from the 17 top-level IPTC topics (friendly labels, minimum 3). Each tap writes a `preference` row on that top-level QCode with a base weight.

*Write:* `(user, medtop:XXXXXXXX, preference, 0.6, onboarding_step1)`

### Step 2 — Go one level deeper `→ preference`

For each top-level topic chosen, reveal its second-level IPTC children as sub-chips (for example, Science and technology opens into "AI", "space", "engineering", "natural sciences"). Selecting sub-chips writes finer `preference` rows and raises the weight; skipping leaves the parent weight intact. This is the active-learning idea applied gently: depth is offered only where the reader already showed interest, so the form stays short.

*Write:* child QCode rows at higher weight; optionally down-weight unselected siblings.

### Step 3 — Name sources you already read `→ preference + knowledge`

Searchable multi-select over the Atlus source list plus free-text for Substacks. Each source carries a stored IPTC distribution (computed from its own classified back catalogue). Selecting the FT therefore adds `preference` weight to economy/business QCodes automatically, and adds `knowledge` weight to the same QCodes because a regular FT reader starts economics above beginner level.

*Write:* `preference` and `knowledge` rows derived from each source's topic distribution.

### Step 4 — Say what you want to understand, in your own words `→ goal`

Free-text box with an LLM parse step. The model maps each goal statement to IPTC QCodes and attaches an `intent` flag: *deepen* (goal overlaps an existing preference) or *diverge* (goal points somewhere the reader does not currently read). Divergent goals are what earn Stretch recommendations.

*Write:* `goal` rows on the mapped QCodes, plus an `intent` value stored alongside. If skipped, seed `goal` from the top two `preference` QCodes and flag as unconfirmed.

### Step 5 — Mark where you are already well-read `→ knowledge`

For each chosen topic, a three-point control: new to this / keep up casually / read closely. Values write `knowledge` weight per QCode, setting the sophistication floor so the engine suppresses explainer pieces where the reader is already strong.

*Optional active-learning check:* for any "read closely" topic, show three or four recent headline concepts and let the reader tap the ones already seen. Confirmed items pre-fill read history so early recommendations avoid repetition.

*Write:* `knowledge` rows; confirmed concepts written to a read-history store keyed on the same QCodes.

### Step 6 — Set your discovery reach `→ config, bounded by knowledge`

A single slider (Gentle / Balanced / Adventurous) sets the Core-Stretch-Discovery ratio. Because IPTC is a tree, "outside your bubble" becomes literal tree distance from your `preference` QCodes, and the `knowledge` vector caps how far a Discovery pick can travel while staying comprehensible. A sensitivity control lets the reader exclude or down-weight topics they would rather avoid, respecting the finding that top-down neutrality taxonomies drive churn.

*Write:* per-user discovery parameters; exclusion flags on specific QCodes.

### Step 7 — Volume and delivery `→ config`

Light (1) / Standard (3) / Deep (5), delivery time, cadence. Sets the size of the daily candidate set the engine fills from the three vectors.

### Step 8 — Confirm and edit your profile `→ read-back`

Plain-language read-back of the assembled vectors: top interests, stated goals, where you are strong, discovery setting. Every line editable, with a chat entry point into the same LLM interface used post-onboarding. This delivers the Description doc's promise that a reader inspects and edits the model's assumptions from the first session.

---

## 4. How the article side meets it (so the two actually connect)

Onboarding is only half a shared space. The other half is tagging every article into the same QCodes. Recommended build, in order of cost:

1. **Use publisher-supplied IPTC codes when present.** Some NewsML/RSS feeds already carry subject codes. Free and authoritative; use directly.
2. **Run the open classifier for the top-level spine.** `classla/multilingual-IPTC-news-topic-classifier` outputs the 17 top-level labels, covers 94 languages (matching your international sources), and reports micro-F1 around 0.80 when you keep only predictions at confidence >= 0.90. Store top labels above that threshold into `article_topics`.
3. **Resolve finer topics by embedding match or LLM.** For second-level and deeper QCodes, embed each IPTC concept (label plus definition) once and take nearest neighbours to the article's title-plus-description embedding, or ask an LLM to pick the best descendant of the predicted top-level topic.

**One honest limitation to design around:** the open classifier wants at least ~75 words for reliable output, and your legal-safe pipeline mostly touches title plus short description. Where the syndicated description is thin, lean on publisher tags first and on embedding or LLM matching second, and treat the classifier as strongest where a fuller synopsis is available. This keeps you inside the metadata-only constraint while still getting robust tags.

---

## 5. Cold start, resolved

With Step 1 alone (three top-level taps), the reader already shares QCodes with the whole classified corpus, so the first daily set can be retrieved immediately. No empty-feed problem. Precision then climbs across the first week from three sources: the deeper onboarding steps, implicit signals (opens, dwell, redirects to publisher), and an optional active-learning nudge that asks about the single most discriminating topic each day. The reader begins warm and gets sharper, and every gain remains inspectable in the Step 8 profile.

---

## 6. Minimum data model additions

```
topics(qcode PK, pref_label, parent_qcode, wikidata_id, level)          -- IPTC tree, loaded once
article_topics(article_id, qcode, confidence, source)                   -- tagging output
user_topic_weights(user_id, qcode, vector, weight, source, updated_at)  -- onboarding + learning writes here
user_config(user_id, discovery_reach, excluded_qcodes, volume, cadence, delivery_time)
user_read_history(user_id, qcode, article_id, seen_at)                  -- repetition avoidance
```

Onboarding writes to `user_topic_weights`, `user_config`, and (via the Step 5 check) `user_read_history`. The recommender reads all three against `article_topics` to assemble Core, Stretch and Discovery.

---

## 7. Build sequence suggested for Henry

First, load the IPTC tree into `topics` and stand up the top-level classifier on the ingestion feed, so articles start accumulating tags. Second, build Steps 1, 7 and 8, the minimum path that produces a usable Preference vector and a working first delivery. Third, layer in Steps 2 to 6 and the source-distribution seeding. Fourth, add the active-learning refinement and implicit feedback loop. Each stage ships something usable, and the shared-vocabulary decision in section 1 means none of it needs reworking later.
