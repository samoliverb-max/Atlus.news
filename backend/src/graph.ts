import type { Pool } from "pg";

// Port of the spreading-activation graph engine from
// frontend/onboarding-prototype.html (neighbours/spread/hopDistance).
// Same weights, same behaviour — just backed by Postgres instead of a
// hardcoded TOPICS object.

export type Vector = "P" | "G" | "K";
export type WeightMap = Record<string, number>;

interface TopicNode {
  qcode: string;
  label: string;
  parent: string | null;
  children: string[];
  retired: boolean;
}

type NeighbourType = "parent" | "child" | "related" | "sibling";

let topics: Map<string, TopicNode> | undefined;
let related: Map<string, string[]> | undefined;

// Loads the full topic graph into memory once, on server start. ~1400 rows —
// trivial to hold in memory, and avoids a DB round trip per spread() call.
export async function loadGraph(pool: Pool): Promise<void> {
  const topicRows = await pool.query<{
    qcode: string;
    label: string;
    parent_qcode: string | null;
    retired: boolean;
  }>("SELECT qcode, label, parent_qcode, retired FROM topics");

  const relatedRows = await pool.query<{ from_qcode: string; to_qcode: string }>(
    "SELECT from_qcode, to_qcode FROM topic_edges WHERE edge_type = 'related'"
  );

  const map = new Map<string, TopicNode>();
  for (const row of topicRows.rows) {
    map.set(row.qcode, {
      qcode: row.qcode,
      label: row.label,
      parent: row.parent_qcode,
      children: [],
      retired: row.retired,
    });
  }
  for (const node of map.values()) {
    if (node.parent && map.has(node.parent)) {
      map.get(node.parent)!.children.push(node.qcode);
    }
  }

  // Stored as one row per pair; the runtime relation is symmetric.
  const rel = new Map<string, string[]>();
  const addRelated = (a: string, b: string) => {
    if (!rel.has(a)) rel.set(a, []);
    rel.get(a)!.push(b);
  };
  for (const row of relatedRows.rows) {
    addRelated(row.from_qcode, row.to_qcode);
    addRelated(row.to_qcode, row.from_qcode);
  }

  topics = map;
  related = rel;
}

function graph(): Map<string, TopicNode> {
  if (!topics) throw new Error("Topic graph not loaded — call loadGraph() on startup");
  return topics;
}

export function getTopic(qcode: string): TopicNode | undefined {
  return graph().get(qcode);
}

export function isValidQcode(qcode: string): boolean {
  return graph().has(qcode);
}

// A reader should never be able to pick a retired IPTC node.
export function isSelectable(qcode: string): boolean {
  const node = graph().get(qcode);
  return !!node && !node.retired;
}

export function neighbours(qcode: string): Array<[string, NeighbourType]> {
  const g = graph();
  const node = g.get(qcode);
  if (!node) return [];
  const out: Array<[string, NeighbourType]> = [];
  if (node.parent) out.push([node.parent, "parent"]);
  for (const child of node.children) out.push([child, "child"]);
  if (node.parent) {
    const parentNode = g.get(node.parent);
    if (parentNode) {
      for (const sibling of parentNode.children) {
        if (sibling !== qcode) out.push([sibling, "sibling"]);
      }
    }
  }
  for (const r of related?.get(qcode) ?? []) out.push([r, "related"]);
  return out;
}

export function hopDistance(a: string, b: string, max = 4): number {
  if (a === b) return 0;
  let frontier = [a];
  const seen = new Set([a]);
  for (let d = 1; d <= max; d++) {
    const next: string[] = [];
    for (const n of frontier) {
      for (const [m] of neighbours(n)) {
        if (!seen.has(m)) {
          if (m === b) return d;
          seen.add(m);
          next.push(m);
        }
      }
    }
    frontier = next;
  }
  return max + 1;
}

const addW = (v: WeightMap, q: string, w: number) => {
  v[q] = Math.min(1, (v[q] ?? 0) + w);
};

// vector: parent 0.45, child 0.35, related 0.40, sibling 0.15 — exactly the
// prototype's coefficients (onboarding-prototype.html:252-254).
export function spread(v: WeightMap, qcode: string, w: number): void {
  addW(v, qcode, w);
  for (const [m, type] of neighbours(qcode)) {
    if (type === "child") addW(v, m, w * 0.35);
    else if (type === "parent") addW(v, m, w * 0.45);
    else if (type === "related") addW(v, m, w * 0.4);
    else if (type === "sibling") addW(v, m, w * 0.15);
  }
}
