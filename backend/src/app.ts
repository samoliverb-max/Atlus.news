import crypto from "node:crypto";
import express, { type NextFunction, type Request, type Response } from "express";
import type { Pool } from "pg";
import { z } from "zod";
import { getTopic, isSelectable } from "./graph.js";
import { applyDirect, applySpread, topN } from "./weights.js";
import { GOAL_KEYWORDS, SOURCES } from "./sources.js";

// The prototype's onboarding step order (frontend/onboarding-prototype.html:311),
// trimmed to the steps that write data. GET /onboarding/state returns saved
// answers keyed by these names; the frontend walks this same order to find
// where to resume.
export const STEP_ORDER = [
  "topics",
  "depth",
  "sources",
  "goals",
  "knowledge",
  "political_consent",
  "political",
  "lens",
  "geography",
  "reach",
  "delivery",
  "demographics",
  "sensitive_consent",
  "sensitive",
] as const;

interface AuthedRequest extends Request {
  userId?: number;
}

function badRequest(res: Response, message: string) {
  res.status(400).json({ error: message });
}

async function upsertProgress(pool: Pool, userId: number, step: string, payload: unknown) {
  await pool.query(
    `INSERT INTO onboarding_progress (user_id, step, payload, saved_at)
     VALUES ($1, $2, $3, now())
     ON CONFLICT (user_id, step) DO UPDATE SET payload = EXCLUDED.payload, saved_at = now()`,
    [userId, step, JSON.stringify(payload)]
  );
}

function validQcodes(qcodes: string[]): boolean {
  return qcodes.every(isSelectable);
}

export function createApp(pool: Pool) {
  const app = express();
  app.use(express.json());

  // Permissive CORS for local dev — the frontend is a static HTML file opened
  // from a different origin (file://, or a plain static server on another port).
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, X-Atlus-Resume");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });

  const auth = async (req: AuthedRequest, res: Response, next: NextFunction) => {
    const token = req.header("X-Atlus-Resume");
    if (!token) return res.status(401).json({ error: "Missing X-Atlus-Resume header" });
    const { rows } = await pool.query<{ id: number }>("SELECT id FROM users WHERE resume_token = $1", [token]);
    if (rows.length === 0) return res.status(401).json({ error: "Unknown resume token" });
    req.userId = rows[0].id;
    next();
  };

  // ---------- reference data (public, no auth — not user-specific) ----------

  app.get("/topics/roots", async (_req, res) => {
    const { rows } = await pool.query(
      "SELECT qcode, label FROM topics WHERE parent_qcode IS NULL AND retired = false ORDER BY label"
    );
    res.json(rows);
  });

  app.get("/topics/:qcode/children", async (req, res) => {
    const { rows } = await pool.query(
      "SELECT qcode, label FROM topics WHERE parent_qcode = $1 AND retired = false ORDER BY label",
      [req.params.qcode]
    );
    res.json(rows);
  });

  app.get("/sources", async (_req, res) => {
    const { rows } = await pool.query("SELECT name, kind FROM source_profiles ORDER BY kind, name");
    res.json(rows);
  });

  // ---------- auth / resumability ----------

  app.post("/onboarding/start", async (req, res) => {
    const schema = z.object({ email: z.string().email() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return badRequest(res, "Valid email required");

    const resumeToken = crypto.randomBytes(24).toString("hex");
    // ON CONFLICT no-op update lets a reader re-enter the same email and get
    // their existing resume_token back, instead of a unique-violation error.
    const { rows } = await pool.query<{ id: number; resume_token: string }>(
      `INSERT INTO users (email, resume_token, status)
       VALUES ($1, $2, 'onboarding')
       ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
       RETURNING id, resume_token`,
      [parsed.data.email, resumeToken]
    );
    res.json({ user_id: rows[0].id, resume_token: rows[0].resume_token });
  });

  app.get("/onboarding/state", auth, async (req: AuthedRequest, res) => {
    const { rows } = await pool.query<{ step: string; payload: unknown }>(
      "SELECT step, payload FROM onboarding_progress WHERE user_id = $1",
      [req.userId]
    );
    const answers: Record<string, unknown> = {};
    for (const row of rows) answers[row.step] = row.payload;
    const doneIdx = STEP_ORDER.findIndex((s) => !(s in answers));
    const current_step = doneIdx === -1 ? STEP_ORDER.length : doneIdx;
    res.json({ answers, current_step });
  });

  // ---------- step 1: topics (Preference) ----------

  app.post("/onboarding/topics", auth, async (req: AuthedRequest, res) => {
    const schema = z.object({ step: z.literal("topics"), topic_qcodes: z.array(z.string()).min(3) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return badRequest(res, "topic_qcodes: minimum 3 required");
    if (!validQcodes(parsed.data.topic_qcodes)) return badRequest(res, "Unknown or retired qcode");

    await upsertProgress(pool, req.userId!, "topics", parsed.data);
    await applySpread(
      pool,
      req.userId!,
      "P",
      parsed.data.topic_qcodes.map((q) => ({ qcode: q, weight: 0.6 })),
      "topics"
    );
    res.json({ ok: true });
  });

  // ---------- step 2: depth (Preference, finer) ----------

  app.post("/onboarding/depth", auth, async (req: AuthedRequest, res) => {
    const schema = z.object({ step: z.literal("depth"), subtopic_qcodes: z.array(z.string()) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return badRequest(res, "Invalid payload");
    if (!validQcodes(parsed.data.subtopic_qcodes)) return badRequest(res, "Unknown or retired qcode");

    await upsertProgress(pool, req.userId!, "depth", parsed.data);
    await applySpread(
      pool,
      req.userId!,
      "P",
      parsed.data.subtopic_qcodes.map((q) => ({ qcode: q, weight: 0.75 })),
      "depth"
    );
    res.json({ ok: true });
  });

  // ---------- step 3: sources (Preference + Knowledge) ----------

  app.post("/onboarding/sources", auth, async (req: AuthedRequest, res) => {
    const schema = z.object({
      step: z.literal("sources"),
      outlets: z.array(z.string()),
      platforms: z.array(z.string()),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return badRequest(res, "Invalid payload");

    await upsertProgress(pool, req.userId!, "sources", parsed.data);

    const pWrites: Array<{ qcode: string; weight: number }> = [];
    const kWrites: Array<{ qcode: string; weight: number }> = [];
    for (const name of [...parsed.data.outlets, ...parsed.data.platforms]) {
      const source = SOURCES.find((s) => s.name === name);
      if (!source) continue;
      for (const [qcode, weight] of Object.entries(source.distribution)) {
        pWrites.push({ qcode, weight: weight * (source.isAggregator ? 0.25 : 0.4) });
        if (!source.isAggregator) kWrites.push({ qcode, weight: weight * 0.5 });
      }
    }
    await applyDirect(pool, req.userId!, "P", pWrites, "sources");
    await applyDirect(pool, req.userId!, "K", kWrites, "sources");
    res.json({ ok: true });
  });

  // ---------- step 4: goals (Goal) ----------

  app.post("/onboarding/goals", auth, async (req: AuthedRequest, res) => {
    const schema = z.object({ step: z.literal("goals"), goal_text: z.string() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return badRequest(res, "Invalid payload");

    await upsertProgress(pool, req.userId!, "goals", parsed.data);

    const text = parsed.data.goal_text.toLowerCase();
    const nodes: string[] = [];
    for (const [kw, qcode] of Object.entries(GOAL_KEYWORDS)) {
      if (text.includes(kw) && !nodes.includes(qcode)) nodes.push(qcode);
    }

    let source = "goals";
    let targets = nodes;
    if (targets.length === 0) {
      // Empty goal text: seed from the reader's top two Preference nodes,
      // flagged unconfirmed (DATA-CONTRACT.md step 4).
      const top = await topN(pool, req.userId!, "P", 2);
      targets = top.map((t) => t.qcode);
      source = "goals:unconfirmed";
    }

    await applySpread(
      pool,
      req.userId!,
      "G",
      targets.map((q) => ({ qcode: q, weight: 0.7 })),
      source
    );
    res.json({ ok: true });
  });

  // ---------- step 5: knowledge (Knowledge) ----------

  app.post("/onboarding/knowledge", auth, async (req: AuthedRequest, res) => {
    const schema = z.object({ step: z.literal("knowledge"), levels: z.record(z.string(), z.number()) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return badRequest(res, "Invalid payload");
    if (!validQcodes(Object.keys(parsed.data.levels))) return badRequest(res, "Unknown or retired qcode");

    await upsertProgress(pool, req.userId!, "knowledge", parsed.data);
    await applySpread(
      pool,
      req.userId!,
      "K",
      Object.entries(parsed.data.levels).map(([qcode, weight]) => ({ qcode, weight })),
      "knowledge"
    );
    res.json({ ok: true });
  });

  // ---------- step 6: political consent gate ----------

  app.post("/onboarding/political-consent", auth, async (req: AuthedRequest, res) => {
    const schema = z.object({
      step: z.literal("political_consent"),
      consent: z.boolean(),
      consented_at: z.string(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return badRequest(res, "Invalid payload");

    await upsertProgress(pool, req.userId!, "political_consent", parsed.data);
    res.json({ ok: true });
  });

  // ---------- step 7: political issue sliders ----------

  const AXES = ["econ", "soc", "intl", "inst"] as const;

  app.post("/onboarding/political", auth, async (req: AuthedRequest, res) => {
    const schema = z.object({
      step: z.literal("political"),
      issue_responses: z.array(
        z.object({
          id: z.number(),
          axis: z.enum(AXES),
          dir: z.number(),
          value: z.number().min(0).max(100),
        })
      ),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return badRequest(res, "Invalid payload");

    const consentRow = await pool.query<{ payload: { consent: boolean; consented_at: string } }>(
      "SELECT payload FROM onboarding_progress WHERE user_id = $1 AND step = 'political_consent'",
      [req.userId]
    );
    if (consentRow.rows.length === 0 || consentRow.rows[0].payload.consent !== true) {
      return res.status(403).json({ error: "Political consent required before this step" });
    }
    const consentedAt = consentRow.rows[0].payload.consented_at;

    await upsertProgress(pool, req.userId!, "political", parsed.data);

    const sums: Record<string, [number, number]> = { econ: [0, 0], soc: [0, 0], intl: [0, 0], inst: [0, 0] };
    for (const r of parsed.data.issue_responses) {
      const signed = ((r.value - 50) / 50) * r.dir;
      sums[r.axis][0] += signed;
      sums[r.axis][1] += 1;
    }
    const scores = Object.fromEntries(AXES.map((ax) => [ax, sums[ax][1] ? sums[ax][0] / sums[ax][1] : 0]));

    await pool.query(
      `INSERT INTO user_political (user_id, consented_at, econ, soc, intl, inst, raw_responses)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id) DO UPDATE SET
         econ = EXCLUDED.econ, soc = EXCLUDED.soc, intl = EXCLUDED.intl, inst = EXCLUDED.inst,
         raw_responses = EXCLUDED.raw_responses`,
      [req.userId, consentedAt, scores.econ, scores.soc, scores.intl, scores.inst, JSON.stringify(parsed.data.issue_responses)]
    );
    res.json({ ok: true, scores });
  });

  // ---------- step 8: political lens (per-topic) ----------

  app.post("/onboarding/lens", auth, async (req: AuthedRequest, res) => {
    const schema = z.object({
      step: z.literal("lens"),
      lenses: z.record(z.string(), z.enum(["match", "balance", "challenge"])),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return badRequest(res, "Invalid payload");

    await upsertProgress(pool, req.userId!, "lens", parsed.data);
    const result = await pool.query(
      "UPDATE user_political SET lenses = $2 WHERE user_id = $1",
      [req.userId, JSON.stringify(parsed.data.lenses)]
    );
    if (result.rowCount === 0) {
      return res.status(403).json({ error: "Political consent + answers required before this step" });
    }
    res.json({ ok: true });
  });

  // ---------- step 9: geography ----------

  app.post("/onboarding/geography", auth, async (req: AuthedRequest, res) => {
    const schema = z.object({ step: z.literal("geography"), interests: z.record(z.string(), z.number()) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return badRequest(res, "Invalid payload");

    await upsertProgress(pool, req.userId!, "geography", parsed.data);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("DELETE FROM user_geo WHERE user_id = $1", [req.userId]);
      for (const [country, interest] of Object.entries(parsed.data.interests)) {
        await client.query("INSERT INTO user_geo (user_id, country, interest) VALUES ($1, $2, $3)", [
          req.userId,
          country,
          interest,
        ]);
      }
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
    res.json({ ok: true });
  });

  // ---------- step 10: reach ----------

  app.post("/onboarding/reach", auth, async (req: AuthedRequest, res) => {
    const schema = z.object({
      step: z.literal("reach"),
      discovery_reach: z.number().int().min(0).max(2),
      excluded_qcodes: z.array(z.string()),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return badRequest(res, "Invalid payload");
    if (!validQcodes(parsed.data.excluded_qcodes)) return badRequest(res, "Unknown or retired qcode");

    await upsertProgress(pool, req.userId!, "reach", parsed.data);
    await pool.query(
      `INSERT INTO user_config (user_id, discovery_reach, excluded_qcodes)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id) DO UPDATE SET discovery_reach = EXCLUDED.discovery_reach, excluded_qcodes = EXCLUDED.excluded_qcodes`,
      [req.userId, parsed.data.discovery_reach, parsed.data.excluded_qcodes]
    );
    res.json({ ok: true });
  });

  // ---------- step 11: delivery ----------

  app.post("/onboarding/delivery", auth, async (req: AuthedRequest, res) => {
    const schema = z.object({
      step: z.literal("delivery"),
      mode: z.union([z.literal(1), z.literal(3), z.literal(5)]),
      send_time: z.string(),
      timezone: z.string(),
      cadence: z.enum(["daily", "weekdays", "weekends"]),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return badRequest(res, "Invalid payload");

    await upsertProgress(pool, req.userId!, "delivery", parsed.data);
    await pool.query(
      `INSERT INTO user_config (user_id, mode, send_time, timezone, cadence)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE SET mode = EXCLUDED.mode, send_time = EXCLUDED.send_time,
         timezone = EXCLUDED.timezone, cadence = EXCLUDED.cadence`,
      [req.userId, parsed.data.mode, parsed.data.send_time, parsed.data.timezone, parsed.data.cadence]
    );
    res.json({ ok: true });
  });

  // ---------- step 12: demographics (non-sensitive) ----------

  app.post("/onboarding/demographics", auth, async (req: AuthedRequest, res) => {
    const nullableStr = z.string().nullable().optional();
    const schema = z.object({
      step: z.literal("demographics"),
      age_band: nullableStr,
      education: nullableStr,
      region: nullableStr,
      work_field: nullableStr,
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return badRequest(res, "Invalid payload");

    await upsertProgress(pool, req.userId!, "demographics", parsed.data);
    await pool.query(
      `INSERT INTO user_demographics (user_id, age_band, education, region, work_field)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE SET age_band = EXCLUDED.age_band, education = EXCLUDED.education,
         region = EXCLUDED.region, work_field = EXCLUDED.work_field`,
      [req.userId, parsed.data.age_band ?? null, parsed.data.education ?? null, parsed.data.region ?? null, parsed.data.work_field ?? null]
    );
    res.json({ ok: true });
  });

  // ---------- step 13: sensitive demographics consent + answers (Art. 9) ----------

  app.post("/onboarding/demographics-consent", auth, async (req: AuthedRequest, res) => {
    const schema = z.object({
      step: z.literal("sensitive_consent"),
      consent: z.boolean(),
      consented_at: z.string(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return badRequest(res, "Invalid payload");

    await upsertProgress(pool, req.userId!, "sensitive_consent", parsed.data);
    res.json({ ok: true });
  });

  app.post("/onboarding/sensitive", auth, async (req: AuthedRequest, res) => {
    const nullableStr = z.string().nullable().optional();
    const schema = z.object({
      step: z.literal("sensitive"),
      ethnicity: nullableStr,
      religion: nullableStr,
      orientation: nullableStr,
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return badRequest(res, "Invalid payload");

    const consentRow = await pool.query<{ payload: { consent: boolean; consented_at: string } }>(
      "SELECT payload FROM onboarding_progress WHERE user_id = $1 AND step = 'sensitive_consent'",
      [req.userId]
    );
    if (consentRow.rows.length === 0 || consentRow.rows[0].payload.consent !== true) {
      return res.status(403).json({ error: "Sensitive-data consent required before this step" });
    }

    await upsertProgress(pool, req.userId!, "sensitive", parsed.data);
    await pool.query(
      `INSERT INTO user_sensitive (user_id, consented_at, ethnicity, religion, orientation)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE SET ethnicity = EXCLUDED.ethnicity, religion = EXCLUDED.religion,
         orientation = EXCLUDED.orientation`,
      [req.userId, consentRow.rows[0].payload.consented_at, parsed.data.ethnicity ?? null, parsed.data.religion ?? null, parsed.data.orientation ?? null]
    );
    res.json({ ok: true });
  });

  // ---------- debug: full vector export (for frontend/iptc-explorer.html's Vectors tab) ----------

  app.get("/onboarding/vectors", auth, async (req: AuthedRequest, res) => {
    const { rows } = await pool.query<{ qcode: string; vector: "P" | "G" | "K"; weight: number; label: string }>(
      `SELECT w.qcode, w.vector, w.weight, t.label FROM user_topic_weights w
       JOIN topics t ON t.qcode = w.qcode
       WHERE w.user_id = $1 AND w.weight > 0
       ORDER BY w.weight DESC`,
      [req.userId]
    );
    const out: Record<"P" | "G" | "K", Array<{ qcode: string; label: string; weight: number }>> = { P: [], G: [], K: [] };
    for (const row of rows) out[row.vector].push({ qcode: row.qcode, label: row.label, weight: row.weight });
    res.json(out);
  });

  // ---------- step 14: profile read-back ----------

  app.get("/onboarding/profile", auth, async (req: AuthedRequest, res) => {
    const userId = req.userId!;
    const [p, g, k, political, geo, demog, config, sensitiveConsent] = await Promise.all([
      topN(pool, userId, "P", 5),
      topN(pool, userId, "G", 4),
      topN(pool, userId, "K", 4),
      pool.query("SELECT econ, soc, intl, inst, lenses FROM user_political WHERE user_id = $1", [userId]),
      pool.query("SELECT country, interest FROM user_geo WHERE user_id = $1 ORDER BY interest DESC", [userId]),
      pool.query("SELECT age_band, education, region, work_field FROM user_demographics WHERE user_id = $1", [userId]),
      pool.query("SELECT discovery_reach, excluded_qcodes, mode FROM user_config WHERE user_id = $1", [userId]),
      pool.query("SELECT 1 FROM user_sensitive WHERE user_id = $1", [userId]),
    ]);

    const excludedWithLabels = (config.rows[0]?.excluded_qcodes ?? []).map((q: string) => ({
      qcode: q,
      label: getTopic(q)?.label ?? q,
    }));

    res.json({
      preference: p,
      goals: g,
      knowledge: k,
      political: political.rows[0] ?? null,
      geo: geo.rows,
      demographics: demog.rows[0] ?? null,
      config: config.rows[0] ?? null,
      excluded: excludedWithLabels,
      has_sensitive_consent: sensitiveConsent.rows.length > 0,
    });
  });

  // ---------- step 15: complete ----------

  app.post("/onboarding/complete", auth, async (req: AuthedRequest, res) => {
    await pool.query("UPDATE users SET status = 'active' WHERE id = $1", [req.userId]);
    res.json({ ok: true });
  });

  return app;
}
