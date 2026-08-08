import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { Pool } from "pg";
import { createApp } from "./app.js";
import { loadGraph } from "./graph.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");

  const pool = new Pool({ connectionString });
  await loadGraph(pool);

  const app = createApp(pool);

  // Serve the frontend from the same origin as the API. In production this
  // means one URL does everything — no CORS, no API_BASE config, just the
  // link. onboarding-prototype.html detects same-origin deployment and uses
  // relative fetch paths automatically (see its API_BASE constant).
  const frontendDir = path.join(__dirname, "..", "..", "frontend");
  app.use(express.static(frontendDir));
  app.get("/", (_req, res) => res.sendFile(path.join(frontendDir, "onboarding-prototype.html")));

  const port = Number(process.env.PORT ?? 4000);
  app.listen(port, () => {
    console.log(`Atlus onboarding API listening on :${port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
