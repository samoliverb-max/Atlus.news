// Ported from the prototype's SOURCES array and GOAL_KEYWORDS map
// (frontend/onboarding-prototype.html:141-172) — same names, same weights.
//
// One adjustment was required: the prototype's TOPICS object is an
// "illustrative subset" (its own comment) using short hand-picked qcodes
// like "medtop:ai" or "medtop:macro" that only exist in that 40-node demo
// graph. The real IPTC feed (loaded by scripts/load-iptc.ts) uses numeric
// qcodes and doesn't have nodes at those short codes at all — writing them
// here would violate the FK to topics(qcode). SYNTHETIC_TO_REAL maps each
// of the prototype's level-2 shorthand codes to the closest real IPTC node,
// found by searching the live vocabulary (see plan for the search). The 17
// top-level codes (medtop:01000000..17000000) are real IPTC top concepts
// already — verified against the live feed — so those are used unchanged.
export const SYNTHETIC_TO_REAL: Record<string, string> = {
  "medtop:ai": "medtop:20001298", // artificial intelligence
  "medtop:space": "medtop:20000739", // space exploration
  "medtop:biotech": "medtop:20000711", // biotechnology
  "medtop:research": "medtop:20000735", // scientific research
  "medtop:macro": "medtop:20000346", // economic trends and indicators
  "medtop:markets": "medtop:20000385", // market and exchange
  "medtop:energy": "medtop:20000256", // energy and resource
  "medtop:startups": "medtop:20001158", // start-up and entrepreneurial business
  "medtop:govt": "medtop:20000593", // government
  "medtop:intl": "medtop:20000638", // international relations
  "medtop:election": "medtop:20000574", // election
  "medtop:techreg": "medtop:20000636", // regulation of industry (closest real node to "tech regulation" — IPTC has no dedicated node)
  "medtop:enpolicy": "medtop:20000423", // environmental policy (closest real node to "energy policy")
  "medtop:climate": "medtop:20000418", // climate change
  "medtop:nature": "medtop:20000441", // nature
  "medtop:meddiscovery": "medtop:20000737", // medical research
  "medtop:pubhealth": "medtop:20001358", // public health
  "medtop:media": "medtop:20000046", // news media
  "medtop:lit": "medtop:20000013", // literature
  "medtop:histideas": "medtop:20000747", // history
  "medtop:wages": "medtop:20000518", // wages and benefits
  "medtop:demog": "medtop:20000770", // demographics
};

function real(qcode: string): string {
  return SYNTHETIC_TO_REAL[qcode] ?? qcode;
}

export interface SourceProfile {
  name: string;
  kind: "outlet" | "platform";
  distribution: Record<string, number>;
  isAggregator: boolean;
}

function mapDist(d: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [q, w] of Object.entries(d)) out[real(q)] = w;
  return out;
}

export const SOURCES: SourceProfile[] = [
  // --- most-read outlets (UK-led, per Reuters Institute usage rankings) ---
  { name: "BBC News", kind: "outlet", isAggregator: false, distribution: mapDist({ "medtop:govt": 0.6, "medtop:intl": 0.5, "medtop:11000000": 0.5, "medtop:14000000": 0.3 }) },
  { name: "Sky News", kind: "outlet", isAggregator: false, distribution: mapDist({ "medtop:govt": 0.5, "medtop:11000000": 0.5, "medtop:02000000": 0.3 }) },
  { name: "The Guardian", kind: "outlet", isAggregator: false, distribution: mapDist({ "medtop:govt": 0.6, "medtop:climate": 0.6, "medtop:media": 0.4, "medtop:01000000": 0.4 }) },
  { name: "Daily Mail / MailOnline", kind: "outlet", isAggregator: false, distribution: mapDist({ "medtop:08000000": 0.6, "medtop:02000000": 0.4, "medtop:10000000": 0.4 }) },
  { name: "The Times", kind: "outlet", isAggregator: false, distribution: mapDist({ "medtop:govt": 0.6, "medtop:04000000": 0.4, "medtop:01000000": 0.3 }) },
  { name: "The Telegraph", kind: "outlet", isAggregator: false, distribution: mapDist({ "medtop:govt": 0.6, "medtop:04000000": 0.4, "medtop:15000000": 0.3 }) },
  { name: "Financial Times", kind: "outlet", isAggregator: false, distribution: mapDist({ "medtop:markets": 0.9, "medtop:macro": 0.8, "medtop:startups": 0.5, "medtop:intl": 0.4 }) },
  { name: "The Economist", kind: "outlet", isAggregator: false, distribution: mapDist({ "medtop:macro": 0.7, "medtop:intl": 0.7, "medtop:govt": 0.5 }) },
  { name: "The Sun", kind: "outlet", isAggregator: false, distribution: mapDist({ "medtop:15000000": 0.6, "medtop:08000000": 0.5, "medtop:10000000": 0.3 }) },
  { name: "ITV News", kind: "outlet", isAggregator: false, distribution: mapDist({ "medtop:govt": 0.5, "medtop:14000000": 0.4 }) },
  { name: "New York Times", kind: "outlet", isAggregator: false, distribution: mapDist({ "medtop:govt": 0.5, "medtop:01000000": 0.5, "medtop:13000000": 0.4 }) },
  { name: "CNN", kind: "outlet", isAggregator: false, distribution: mapDist({ "medtop:intl": 0.5, "medtop:11000000": 0.5 }) },
  // --- aggregators & platforms (how most people actually meet news) ---
  { name: "Apple News", kind: "platform", isAggregator: true, distribution: mapDist({ "medtop:11000000": 0.3, "medtop:10000000": 0.3, "medtop:08000000": 0.2 }) },
  { name: "Google News / Discover", kind: "platform", isAggregator: true, distribution: mapDist({ "medtop:11000000": 0.3, "medtop:13000000": 0.3 }) },
  { name: "YouTube", kind: "platform", isAggregator: true, distribution: mapDist({ "medtop:13000000": 0.3, "medtop:01000000": 0.3 }) },
  { name: "TikTok", kind: "platform", isAggregator: true, distribution: mapDist({ "medtop:08000000": 0.3, "medtop:10000000": 0.3, "medtop:01000000": 0.2 }) },
  { name: "Instagram", kind: "platform", isAggregator: true, distribution: mapDist({ "medtop:10000000": 0.3, "medtop:08000000": 0.3, "medtop:01000000": 0.2 }) },
  { name: "X / Twitter", kind: "platform", isAggregator: true, distribution: mapDist({ "medtop:11000000": 0.4, "medtop:13000000": 0.3, "medtop:15000000": 0.2 }) },
  { name: "Facebook", kind: "platform", isAggregator: true, distribution: mapDist({ "medtop:08000000": 0.3, "medtop:14000000": 0.2 }) },
  { name: "Reddit", kind: "platform", isAggregator: true, distribution: mapDist({ "medtop:13000000": 0.4, "medtop:10000000": 0.3 }) },
  { name: "LinkedIn", kind: "platform", isAggregator: true, distribution: mapDist({ "medtop:startups": 0.4, "medtop:09000000": 0.3 }) },
  { name: "Podcasts", kind: "platform", isAggregator: true, distribution: mapDist({ "medtop:11000000": 0.3, "medtop:01000000": 0.3, "medtop:histideas": 0.2 }) },
  { name: "Substack newsletters", kind: "platform", isAggregator: true, distribution: mapDist({ "medtop:13000000": 0.3, "medtop:11000000": 0.3, "medtop:histideas": 0.3 }) },
  { name: "WhatsApp / group chats", kind: "platform", isAggregator: true, distribution: mapDist({ "medtop:08000000": 0.2 }) },
];

export const GOAL_KEYWORDS: Record<string, string> = {
  economics: real("medtop:macro"),
  economy: real("medtop:macro"),
  inflation: real("medtop:macro"),
  finance: real("medtop:markets"),
  ai: real("medtop:ai"),
  technology: "medtop:13000000",
  climate: real("medtop:climate"),
  energy: real("medtop:energy"),
  environment: "medtop:06000000",
  politics: "medtop:11000000",
  geopolitics: real("medtop:intl"),
  international: real("medtop:intl"),
  china: real("medtop:intl"),
  health: "medtop:07000000",
  medicine: real("medtop:meddiscovery"),
  history: real("medtop:histideas"),
  media: real("medtop:media"),
  regulation: real("medtop:techreg"),
  policy: real("medtop:govt"),
  migration: real("medtop:demog"),
  work: real("medtop:wages"),
  labour: real("medtop:wages"),
  science: real("medtop:research"),
  space: real("medtop:space"),
};
