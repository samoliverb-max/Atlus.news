// Local dev bootstrap for machines without a real Postgres/Docker install.
// Boots PGlite (a real Postgres-wire-protocol server, in-process — the same
// engine test/e2e.test.ts uses) with data persisted to backend/.pglite-data,
// runs the normal migrate/load-iptc/seed-sources one-time setup if the
// schema isn't there yet, then starts the real server.ts against it.
// Swapping to a real Postgres later is just a DATABASE_URL change.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { Pool } from "pg";
import { migrate } from "./migrate.js";
import { loadIptc } from "./load-iptc.js";
import { seedSources } from "./seed-sources.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PG_PORT = Number(process.env.PGLITE_PORT ?? 55432);
const dataDir = path.join(__dirname, "..", ".pglite-data");

async function main() {
  const pglite = await PGlite.create(dataDir);
  const socketServer = new PGLiteSocketServer({ db: pglite, port: PG_PORT, host: "127.0.0.1", maxConnections: 15 });
  await socketServer.start();
  console.log(`PGlite Postgres-wire server on 127.0.0.1:${PG_PORT} (data: ${dataDir})`);

  const connectionString = `postgres://postgres@127.0.0.1:${PG_PORT}/postgres`;
  const pool = new Pool({ connectionString });

  const { rows } = await pool.query(
    `SELECT 1 FROM information_schema.tables WHERE table_name = 'topics'`
  );
  if (rows.length === 0) {
    console.log("No schema yet — running migrate + load-iptc + seed-sources...");
    await migrate(pool);
    const { topicCount, edgeCount } = await loadIptc(pool);
    console.log(`Loaded ${topicCount} topics, ${edgeCount} edges.`);
    const { count } = await seedSources(pool);
    console.log(`Seeded ${count} source profiles.`);
  } else {
    console.log("Schema already present — skipping one-time setup.");
  }
  await pool.end();

  process.env.DATABASE_URL = connectionString;
  process.env.PORT = process.env.PORT ?? "4000";
  await import("../src/server.js");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
