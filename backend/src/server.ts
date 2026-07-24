import "dotenv/config";
import { Pool } from "pg";
import { createApp } from "./app.js";
import { loadGraph } from "./graph.js";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");

  const pool = new Pool({ connectionString });
  await loadGraph(pool);

  const app = createApp(pool);
  const port = Number(process.env.PORT ?? 4000);
  app.listen(port, () => {
    console.log(`Atlus onboarding API listening on :${port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
