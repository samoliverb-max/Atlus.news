import "dotenv/config";
import { Pool } from "pg";
import { SOURCES } from "../src/sources.js";

export async function seedSources(pool: Pool) {
  for (const s of SOURCES) {
    await pool.query(
      `INSERT INTO source_profiles (name, kind, distribution)
       VALUES ($1, $2, $3)
       ON CONFLICT (name) DO UPDATE SET kind = EXCLUDED.kind, distribution = EXCLUDED.distribution`,
      [s.name, s.kind, JSON.stringify(s.distribution)]
    );
  }
  return { count: SOURCES.length };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  const pool = new Pool({ connectionString });
  seedSources(pool)
    .then(({ count }) => {
      console.log(`Seeded ${count} source profiles.`);
      return pool.end();
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
