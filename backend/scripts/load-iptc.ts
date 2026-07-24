import "dotenv/config";
import { Pool } from "pg";

const IPTC_URL = "https://cv.iptc.org/newscodes/mediatopic?format=json&lang=en-GB";

interface IptcConcept {
  qcode: string;
  prefLabel?: Record<string, string>;
  definition?: Record<string, string>;
  broader?: string[]; // full URIs, e.g. ".../mediatopic/01000000"
  narrower?: string[]; // qcodes, e.g. "medtop:20000002"
  exactMatch?: string[];
  retired?: string; // date string when retired, absent when active
}

interface IptcFeed {
  hasTopConcept: string[]; // full URIs
  conceptSet: IptcConcept[];
}

function qcodeFromUri(uri: string): string {
  return "medtop:" + uri.replace(/\/$/, "").split("/").pop();
}

function wikidataId(c: IptcConcept): string | null {
  const hit = (c.exactMatch ?? []).find((u) => u.includes("wikidata.org/entity/"));
  return hit ? hit.split("/").pop()! : null;
}

interface TopicRow {
  qcode: string;
  label: string;
  definition: string | null;
  level: number;
  parent_qcode: string | null;
  wikidata_id: string | null;
  retired: boolean;
}

export function parseFeed(feed: IptcFeed): { topics: TopicRow[]; edges: Array<{ from: string; to: string }> } {
  const byQcode = new Map(feed.conceptSet.map((c) => [c.qcode, c]));

  // BFS from the 17 top concepts computes `level` and gives an insert order
  // where every parent lands before its children — required for the
  // self-referencing topics.parent_qcode FK.
  const level = new Map<string, number>();
  const order: string[] = [];
  const queue: string[] = feed.hasTopConcept.map(qcodeFromUri);
  for (const q of queue) level.set(q, 1);
  while (queue.length > 0) {
    const q = queue.shift()!;
    order.push(q);
    const c = byQcode.get(q);
    if (!c) continue;
    for (const child of c.narrower ?? []) {
      if (!level.has(child)) {
        level.set(child, level.get(q)! + 1);
        queue.push(child);
      }
    }
  }
  // Any concept the BFS didn't reach (shouldn't happen against the live
  // feed, but don't silently drop data if it ever does) goes in last.
  for (const c of feed.conceptSet) {
    if (!level.has(c.qcode)) order.push(c.qcode);
  }

  const topics: TopicRow[] = order.map((q) => {
    const c = byQcode.get(q)!;
    const parent = c.broader?.[0] ? qcodeFromUri(c.broader[0]) : null;
    return {
      qcode: q,
      label: c.prefLabel?.["en-GB"] ?? q,
      definition: c.definition?.["en-GB"] ?? null,
      level: level.get(q) ?? 1,
      parent_qcode: parent,
      wikidata_id: wikidataId(c),
      retired: !!c.retired,
    };
  });

  const edges = topics.filter((t) => t.parent_qcode).map((t) => ({ from: t.qcode, to: t.parent_qcode! }));

  return { topics, edges };
}

export async function loadIptc(pool: Pool, feed?: IptcFeed) {
  const data = feed ?? ((await (await fetch(IPTC_URL)).json()) as IptcFeed);
  const { topics, edges } = parseFeed(data);

  for (const t of topics) {
    await pool.query(
      `INSERT INTO topics (qcode, label, definition, level, parent_qcode, wikidata_id, retired)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (qcode) DO UPDATE SET
         label = EXCLUDED.label, definition = EXCLUDED.definition, level = EXCLUDED.level,
         parent_qcode = EXCLUDED.parent_qcode, wikidata_id = EXCLUDED.wikidata_id, retired = EXCLUDED.retired`,
      [t.qcode, t.label, t.definition, t.level, t.parent_qcode, t.wikidata_id, t.retired]
    );
  }

  for (const e of edges) {
    await pool.query(
      `INSERT INTO topic_edges (from_qcode, to_qcode, edge_type, provenance, weight)
       VALUES ($1, $2, 'tree', 'iptc-tree', 1.0)
       ON CONFLICT (from_qcode, to_qcode, edge_type) DO NOTHING`,
      [e.from, e.to]
    );
  }

  return { topicCount: topics.length, edgeCount: edges.length };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  const pool = new Pool({ connectionString });
  loadIptc(pool)
    .then(({ topicCount, edgeCount }) => {
      console.log(`Loaded ${topicCount} topics, ${edgeCount} tree edges.`);
      return pool.end();
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
