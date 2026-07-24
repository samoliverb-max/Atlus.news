# Atlus — The Full Node Map: Structure, Links, and How We Use All ~1,200

**Companion to:** `atlus-iptc-explorer.html` — the interactive off-ramp that shows every node live. Open it in a browser: it loads the current official vocabulary straight from IPTC's server (with a two-click fallback if blocked), so it is never out of date. Tree view for browsing and search; Constellation view to see all ~1,200 nodes and their links at once. IPTC also hosts its own plain viewer at https://www.iptc.org/std/NewsCodes/treeview/mediatopic/mediatopic-en-GB.html — a good link to put in front of publishers.

---

## 1. The shape of the vocabulary

Roughly 1,200 live concepts, arranged as a five-level tree under 17 top-level branches, plus sideways links. Licence is CC-BY 4.0 (free to use with attribution), refreshed by IPTC at least yearly, and every concept carries a stable QCode (e.g. `medtop:20000523`) that never changes meaning, which is what makes it safe to build a database on.

**Levels, concretely:**

- **Level 1 — 17 branches.** The onboarding chips. Broad desks of news.
- **Level 2 — ~180 concepts.** The onboarding depth taps. "Artificial intelligence", "macroeconomics", "elections".
- **Levels 3–5 — the remaining ~1,000.** Fine resolution: "large language models" sits under AI; "central banks" under macroeconomics. Too fine to ask about, ideal to *infer* onto.

## 2. The 17 branches (what actually lives inside each)

| Branch | Contains (IPTC's own scope) |
|---|---|
| **arts, culture, entertainment and media** | Cinema, music, literature, fashion, festivals, museums, language, cultural heritage, news media, social media, disinformation |
| **crime, law and justice** | Crime, courts, judges, trials, law enforcement, punishment |
| **disaster, accident and emergency incident** | Natural disasters, transport accidents, explosions, emergency response |
| **economy, business and finance** | Companies, industries, national economy, trade, banks, currency, inflation, GDP, mortgages, utilities |
| **education** | Schools, curricula, teachers, students, remote learning |
| **environment** | Climate change, sustainability, pollution, natural resources, ecosystems, wildlife |
| **health** | Diseases, treatments, mental health, vaccines, hospitals, health policy, insurance |
| **human interest** | Celebrity, awards, ceremonies, anniversaries, curiosities |
| **labour** | Employment, wages, unions, retirement, unemployment, parental leave |
| **lifestyle and leisure** | Hobbies, games, food and drink, travel, fitness, wellbeing, leisure venues |
| **politics** | Elections, government, fundamental rights, NGOs, policy, international relations (non-violent) |
| **religion** | Faiths, religious leaders, rituals, church–state relations |
| **science and technology** | Natural and social sciences, mathematics, engineering, research, innovation |
| **society** | Demographics, migration, discrimination, communities, family, ethics, poverty, social problems |
| **sport** | All competitive sport, events, clubs, venues, governance |
| **conflict, war and peace** | Wars, terrorism, civil unrest, cyber warfare, peace processes |
| **weather** | Forecasts, phenomena, warnings |

Full contents of every branch, to all five levels: **use the explorer** — search box for anything ("inflation", "opera", "drones"), click-through for definitions, children, and links. Enumerating a thousand nodes in a document would go stale at the next IPTC release; the explorer cannot.

## 3. How nodes link together (the part that powers Atlus)

Three edge types, all visible per-node in the explorer's detail panel:

**Parent–child (`broader`/`narrower`).** The tree itself. Gives descent (broad interest → precise interest) and ascent (precise article → broad reader). This is how three onboarding taps can address the whole map: weight flows down from a branch to its descendants.

**Cross-branch (`skos:related`).** Sideways edges between topics in different branches that genuinely touch — the purple arcs in the Constellation view. These are editorial judgements by news-industry taxonomists, and they are the premium edges for Stretch: a sibling is more of the same shelf, but a related-link partner is a different lens on a subject the reader already cares about. They are also sparse — not every intuitive adjacency has one — so our edge table records provenance (`iptc-tree`, `iptc-related`, `wikidata`, `co-occurrence`) and can add inferred edges without polluting the official ones.

**Wikidata (`exactMatch`).** Most concepts anchor to a Wikidata entity, linking our map into the world's largest open knowledge graph. Near-term value: disambiguation and multilingual labels. Later value: densifying the sideways graph and entity-level personalisation (following a *company* or *person*, not just a topic).

## 4. How a reader's profile sits on all 1,200 (specificity without interrogation)

The reader only ever *answers* at levels 1–2 (17 chips, then ~180 depth taps — the explorer shows exactly what those unlock). Full 1,200-node specificity comes from three quiet mechanisms:

1. **Spreading activation** pushes every volunteered weight along the edges above, so "artificial intelligence" lights "large language models", "computing" and (via a related edge) "technology regulation" at decayed strength.
2. **Article feedback** in the daily email writes at whatever depth the article was tagged — one "more like this" tap on an LLM piece adjusts a level-4 node directly. Depth accrues from use, not from a longer form.
3. **Goal parsing** maps free-text ("I want to follow AI without the hype") onto precise nodes wherever the words reach.

So the questionnaire stays humane while the profile converges, over weeks, toward genuine 1,200-node resolution — every weight still traceable to something the reader deliberately did, and every node inspectable on their profile page.

## 5. What the explorer shows, view by view

**Tree view.** All branches collapsible to five levels, live search across every label, per-node counts of descendants and cross-links. Click any node: IPTC definition, its path from the branch root, children, cross-branch links (clickable jumps), Wikidata anchors, and an "How Atlus uses this node" panel explaining Core/Stretch/Discovery from that node's position.

**Constellation view.** The whole vocabulary at once: 17 branch clusters arranged radially, ~1,200 dots sized by level, grey spokes for hierarchy, purple arcs for the cross-branch related links. Click any dot to open its detail. This is the picture to show partners and investors: the industry's map of news, with our three reader vectors living on top of it.
