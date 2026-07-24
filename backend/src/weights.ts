import type { Pool } from "pg";
import { spread, type Vector, type WeightMap } from "./graph.js";

async function loadVector(pool: Pool, userId: number, vector: Vector): Promise<WeightMap> {
  const { rows } = await pool.query<{ qcode: string; weight: number }>(
    "SELECT qcode, weight FROM user_topic_weights WHERE user_id = $1 AND vector = $2",
    [userId, vector]
  );
  const map: WeightMap = {};
  for (const row of rows) map[row.qcode] = row.weight;
  return map;
}

async function persist(
  pool: Pool,
  userId: number,
  vector: Vector,
  before: WeightMap,
  after: WeightMap,
  source: string
): Promise<void> {
  const changed = Object.keys(after).filter((q) => after[q] !== (before[q] ?? 0));
  if (changed.length === 0) return;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const qcode of changed) {
      await client.query(
        `INSERT INTO user_topic_weights (user_id, qcode, vector, weight, source, updated_at)
         VALUES ($1, $2, $3, $4, $5, now())
         ON CONFLICT (user_id, qcode, vector)
         DO UPDATE SET weight = EXCLUDED.weight, source = EXCLUDED.source, updated_at = now()`,
        [userId, qcode, vector, after[qcode], source]
      );
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// spread() caps additively at 1.0 against whatever's already in the vector.
// The prototype gets this for free because S.P/S.G/S.K stay alive in memory
// for the whole session. The backend has to reconstruct that: pull the
// user's *persisted* vector, spread against it, then write back only what
// changed. Capping against a step-local empty map instead of the persisted
// state would let repeated small nudges blow past 1.0 across steps — the
// one subtlety in this port.
export async function applySpread(
  pool: Pool,
  userId: number,
  vector: Vector,
  writes: Array<{ qcode: string; weight: number }>,
  source: string
): Promise<void> {
  if (writes.length === 0) return;
  const before = await loadVector(pool, userId, vector);
  const after = { ...before };
  for (const w of writes) spread(after, w.qcode, w.weight);
  await persist(pool, userId, vector, before, after, source);
}

// The sources step bumps exact tagged nodes directly (addW), with no
// neighbour propagation — matches stepSources() in the prototype, which
// calls addW() not spread() (onboarding-prototype.html:571-572).
export async function applyDirect(
  pool: Pool,
  userId: number,
  vector: Vector,
  writes: Array<{ qcode: string; weight: number }>,
  source: string
): Promise<void> {
  if (writes.length === 0) return;
  const before = await loadVector(pool, userId, vector);
  const after = { ...before };
  for (const w of writes) after[w.qcode] = Math.min(1, (after[w.qcode] ?? 0) + w.weight);
  await persist(pool, userId, vector, before, after, source);
}

export async function getVector(pool: Pool, userId: number, vector: Vector): Promise<WeightMap> {
  return loadVector(pool, userId, vector);
}

export async function topN(
  pool: Pool,
  userId: number,
  vector: Vector,
  n: number
): Promise<Array<{ qcode: string; label: string; weight: number }>> {
  const { rows } = await pool.query<{ qcode: string; label: string; weight: number }>(
    `SELECT w.qcode, t.label, w.weight FROM user_topic_weights w
     JOIN topics t ON t.qcode = w.qcode
     WHERE w.user_id = $1 AND w.vector = $2
     ORDER BY w.weight DESC LIMIT $3`,
    [userId, vector, n]
  );
  return rows;
}
