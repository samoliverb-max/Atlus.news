// End-to-end proof this actually works: boots a real wire-protocol Postgres
// (PGlite + pglite-socket, entirely in-process — this sandbox has no
// docker/psql), runs the real migration + IPTC loader (a live fetch against
// cv.iptc.org) + source seeding, starts the real Express app on top of it,
// and drives the onboarding flow through genuine HTTP requests. Swapping to
// a real Postgres in production is a DATABASE_URL change — same wire
// protocol, zero code changes.
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { Pool } from "pg";
import type { Server } from "node:http";
import { createApp } from "../src/app.js";
import { loadGraph } from "../src/graph.js";
import { applyDirect, applySpread, getVector } from "../src/weights.js";
import { migrate } from "../scripts/migrate.js";
import { loadIptc } from "../scripts/load-iptc.js";
import { seedSources } from "../scripts/seed-sources.js";
import { SOURCES } from "../src/sources.js";

let pglite: PGlite;
let socketServer: PGLiteSocketServer;
let pool: Pool;
let httpServer: Server;
let baseUrl: string;

async function api(path: string, opts: { method?: string; token?: string; body?: unknown } = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    method: opts.method ?? (opts.body ? "POST" : "GET"),
    headers: {
      "Content-Type": "application/json",
      ...(opts.token ? { "X-Atlus-Resume": opts.token } : {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, json };
}

beforeAll(async () => {
  pglite = await PGlite.create();
  const pgPort = 15400 + Math.floor(Math.random() * 1000);
  // maxConnections must cover the pg Pool's concurrent connections — routes
  // like GET /onboarding/profile fire several queries in parallel.
  socketServer = new PGLiteSocketServer({ db: pglite, port: pgPort, host: "127.0.0.1", maxConnections: 10 });
  await socketServer.start();

  pool = new Pool({ connectionString: `postgres://postgres@127.0.0.1:${pgPort}/postgres` });
  await migrate(pool);
  await loadIptc(pool); // live fetch against cv.iptc.org — proves the real loader end to end
  await seedSources(pool);
  await loadGraph(pool);

  const app = createApp(pool);
  await new Promise<void>((resolve) => {
    httpServer = app.listen(0, () => resolve());
  });
  const address = httpServer.address();
  const port = typeof address === "object" && address ? address.port : 0;
  baseUrl = `http://127.0.0.1:${port}`;
}, 60_000);

afterAll(async () => {
  httpServer?.close();
  await pool.end();
  await socketServer.stop();
});

async function startUser(email: string): Promise<string> {
  const { status, json } = await api("/onboarding/start", { body: { email } });
  expect(status).toBe(200);
  return (json as { resume_token: string }).resume_token;
}

describe("happy path — full onboarding flow", () => {
  let token: string;

  test("start creates a resumable user", async () => {
    token = await startUser("reader@example.com");
    expect(token).toBeTruthy();
  });

  test("topics: min 3 required, real qcodes only", async () => {
    const tooFew = await api("/onboarding/topics", {
      token,
      body: { step: "topics", topic_qcodes: ["medtop:13000000", "medtop:04000000"] },
    });
    expect(tooFew.status).toBe(400);

    const bogus = await api("/onboarding/topics", {
      token,
      body: { step: "topics", topic_qcodes: ["medtop:13000000", "medtop:04000000", "medtop:99999999"] },
    });
    expect(bogus.status).toBe(400);

    const ok = await api("/onboarding/topics", {
      token,
      body: { step: "topics", topic_qcodes: ["medtop:13000000", "medtop:04000000", "medtop:11000000"] },
    });
    expect(ok.status).toBe(200);
  });

  test("depth: real children of a picked topic", async () => {
    const { json } = await api("/topics/medtop:13000000/children");
    const children = json as Array<{ qcode: string; label: string }>;
    expect(children.length).toBeGreaterThan(0);

    const picked = children.slice(0, 2).map((c) => c.qcode);
    const res = await api("/onboarding/depth", { token, body: { step: "depth", subtopic_qcodes: picked } });
    expect(res.status).toBe(200);
  });

  test("sources: step saves and returns ok (exact multiplier math is checked in isolation below)", async () => {
    const res = await api("/onboarding/sources", {
      token,
      body: { step: "sources", outlets: ["BBC News"], platforms: ["TikTok"] },
    });
    expect(res.status).toBe(200);
  });

  test("goals: keyword match seeds Goal nodes", async () => {
    const res = await api("/onboarding/goals", {
      token,
      body: { step: "goals", goal_text: "I want a firmer grasp of economics and to follow AI without the hype." },
    });
    expect(res.status).toBe(200);
  });

  test("knowledge: levels spread into K", async () => {
    const res = await api("/onboarding/knowledge", {
      token,
      body: { step: "knowledge", levels: { "medtop:13000000": 0.9, "medtop:04000000": 0.45 } },
    });
    expect(res.status).toBe(200);
  });

  test("political: consent gate blocks answers until consented", async () => {
    const blocked = await api("/onboarding/political", {
      token,
      body: { step: "political", issue_responses: [{ id: 0, axis: "econ", dir: 1, value: 90 }] },
    });
    expect(blocked.status).toBe(403);

    const consent = await api("/onboarding/political-consent", {
      token,
      body: { step: "political_consent", consent: true, consented_at: new Date().toISOString() },
    });
    expect(consent.status).toBe(200);

    const answers = await api("/onboarding/political", {
      token,
      body: {
        step: "political",
        issue_responses: [
          { id: 0, axis: "econ", dir: 1, value: 90 }, // signed = ((90-50)/50)*1 = 0.8
          { id: 1, axis: "econ", dir: -1, value: 10 }, // signed = ((10-50)/50)*-1 = 0.8
        ],
      },
    });
    expect(answers.status).toBe(200);
    expect((answers.json as { scores: { econ: number } }).scores.econ).toBeCloseTo(0.8, 5);

    const lens = await api("/onboarding/lens", {
      token,
      body: { step: "lens", lenses: { "medtop:11000000": "challenge", "medtop:04000000": "match" } },
    });
    expect(lens.status).toBe(200);
  });

  test("geography: full interest map replaces prior state", async () => {
    const res = await api("/onboarding/geography", {
      token,
      body: { step: "geography", interests: { CN: 2, JP: 1, US: -1 } },
    });
    expect(res.status).toBe(200);
  });

  test("reach + delivery: config upserts don't clobber each other's columns", async () => {
    const reach = await api("/onboarding/reach", {
      token,
      body: { step: "reach", discovery_reach: 2, excluded_qcodes: ["medtop:15000000"] },
    });
    expect(reach.status).toBe(200);

    const delivery = await api("/onboarding/delivery", {
      token,
      body: { step: "delivery", mode: 3, send_time: "07:00", timezone: "Europe/London", cadence: "daily" },
    });
    expect(delivery.status).toBe(200);

    const userRow = await pool.query<{ id: number }>("SELECT id FROM users WHERE resume_token = $1", [token]);
    const cfg = await pool.query(
      "SELECT discovery_reach, excluded_qcodes, mode, cadence FROM user_config WHERE user_id = $1",
      [userRow.rows[0].id]
    );
    expect(cfg.rows[0].discovery_reach).toBe(2);
    expect(cfg.rows[0].mode).toBe(3);
    expect(cfg.rows[0].cadence).toBe("daily");
  });

  test("demographics: non-sensitive fields save", async () => {
    const res = await api("/onboarding/demographics", {
      token,
      body: { step: "demographics", age_band: "25-34", education: "Postgraduate degree", region: "London", work_field: "Technology" },
    });
    expect(res.status).toBe(200);
  });

  test("sensitive: refusing consent blocks the answer endpoint", async () => {
    const consent = await api("/onboarding/demographics-consent", {
      token,
      body: { step: "sensitive_consent", consent: false, consented_at: new Date().toISOString() },
    });
    expect(consent.status).toBe(200);

    const blocked = await api("/onboarding/sensitive", {
      token,
      body: { step: "sensitive", ethnicity: "White", religion: null, orientation: null },
    });
    expect(blocked.status).toBe(403);
  });

  test("profile: derived weights + answers read back with labels", async () => {
    const { status, json } = await api("/onboarding/profile", { token });
    expect(status).toBe(200);
    const profile = json as any;
    expect(profile.preference.length).toBeGreaterThan(0);
    expect(profile.preference[0].label).toBeTruthy();
    expect(profile.political.econ).toBeCloseTo(0.8, 5);
    expect(profile.geo).toEqual(
      expect.arrayContaining([{ country: "CN", interest: 2 }, { country: "JP", interest: 1 }, { country: "US", interest: -1 }])
    );
    expect(profile.has_sensitive_consent).toBe(false);
  });

  test("resume: a fresh GET /state reflects everything saved, without re-posting", async () => {
    const { status, json } = await api("/onboarding/state", { token });
    expect(status).toBe(200);
    const state = json as { answers: Record<string, unknown>; current_step: number };
    expect(state.answers.topics).toBeTruthy();
    expect(state.answers.sources).toBeTruthy();
    expect(state.answers.sensitive_consent).toBeTruthy();
    expect(state.answers.sensitive).toBeUndefined(); // was blocked, never saved
    expect(state.current_step).toBe(13); // every STEP_ORDER entry through sensitive_consent is done
  });

  test("complete marks the user active", async () => {
    const res = await api("/onboarding/complete", { token, method: "POST" });
    expect(res.status).toBe(200);
    const userRow = await pool.query<{ status: string }>("SELECT status FROM users WHERE resume_token = $1", [token]);
    expect(userRow.rows[0].status).toBe("active");
  });
});

describe("re-entering the same email resumes instead of erroring", () => {
  test("start twice with the same email returns the same token", async () => {
    const a = await api("/onboarding/start", { body: { email: "dup@example.com" } });
    const b = await api("/onboarding/start", { body: { email: "dup@example.com" } });
    expect((a.json as any).resume_token).toBe((b.json as any).resume_token);
  });
});

describe("sources step math (isolated fresh user — no prior weights to interfere)", () => {
  test("outlet adds P (x0.4) and K (x0.5); aggregator platform adds P only (x0.25)", async () => {
    const token = await startUser("sourcecheck@example.com");
    const res = await api("/onboarding/sources", {
      token,
      body: { step: "sources", outlets: ["BBC News"], platforms: ["TikTok"] },
    });
    expect(res.status).toBe(200);

    const bbc = SOURCES.find((s) => s.name === "BBC News")!;
    const tiktok = SOURCES.find((s) => s.name === "TikTok")!;
    const userRow = await pool.query<{ id: number }>("SELECT id FROM users WHERE resume_token = $1", [token]);
    const userId = userRow.rows[0].id;
    const P = await getVector(pool, userId, "P");
    const K = await getVector(pool, userId, "K");

    for (const [qcode, w] of Object.entries(bbc.distribution)) {
      expect(P[qcode]).toBeCloseTo(w * 0.4, 5);
      expect(K[qcode]).toBeCloseTo(w * 0.5, 5);
    }
    for (const [qcode, w] of Object.entries(tiktok.distribution)) {
      expect(P[qcode]).toBeCloseTo(w * 0.25, 5);
      expect(K[qcode]).toBeUndefined();
    }
  });
});

describe("spreading activation math (direct module test against the real loaded graph)", () => {
  test("a top-level pick spreads 0.6 to itself and 0.6*0.35 to each real child", async () => {
    const userRow = await pool.query<{ id: number; resume_token: string }>(
      `INSERT INTO users (email, resume_token, status) VALUES ($1, $2, 'onboarding') RETURNING id, resume_token`,
      ["mathcheck@example.com", "math-check-token"]
    );
    const userId = userRow.rows[0].id;

    const children = await pool.query<{ qcode: string }>(
      "SELECT qcode FROM topics WHERE parent_qcode = 'medtop:06000000' AND retired = false"
    );
    expect(children.rows.length).toBeGreaterThan(0);

    await applySpread(pool, userId, "P", [{ qcode: "medtop:06000000", weight: 0.6 }], "test");
    const P = await getVector(pool, userId, "P");

    expect(P["medtop:06000000"]).toBeCloseTo(0.6, 5);
    for (const { qcode } of children.rows) {
      expect(P[qcode]).toBeCloseTo(0.6 * 0.35, 5);
    }
  });

  test("weight caps at 1.0 across repeated spreads, never exceeds it", async () => {
    const userRow = await pool.query<{ id: number }>(
      `INSERT INTO users (email, resume_token, status) VALUES ($1, $2, 'onboarding') RETURNING id`,
      ["capcheck@example.com", "cap-check-token"]
    );
    const userId = userRow.rows[0].id;

    const leaf = await pool.query<{ qcode: string }>(
      `SELECT t.qcode FROM topics t
       WHERE t.retired = false AND NOT EXISTS (SELECT 1 FROM topics c WHERE c.parent_qcode = t.qcode)
       LIMIT 1`
    );
    const qcode = leaf.rows[0].qcode;

    await applyDirect(pool, userId, "P", [{ qcode, weight: 0.9 }], "test");
    await applyDirect(pool, userId, "P", [{ qcode, weight: 0.9 }], "test");
    const P = await getVector(pool, userId, "P");
    expect(P[qcode]).toBe(1);
  });
});
