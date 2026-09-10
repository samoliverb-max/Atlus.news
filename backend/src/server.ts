import "dotenv/config";
import path from "node:path";
import { existsSync } from "node:fs";
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

  // The onboarding UI lives in its own repo (atlusnews/atlus-frontend-poc-dev)
  // and deploys separately, so this is an API-only service by default. CORS is
  // already permissive, and the UI points at this origin via ?api=.
  //
  // If a frontend/ directory happens to sit alongside — a checkout of both
  // repos side by side, or an image that copies one in — serve it from the
  // same origin too, so one URL does everything and no ?api= is needed.
  const frontendDir = path.join(__dirname, "..", "..", "frontend");
  if (existsSync(path.join(frontendDir, "onboarding-prototype.html"))) {
    app.use(express.static(frontendDir));
    app.get("/", (_req, res) => res.sendFile(path.join(frontendDir, "onboarding-prototype.html")));
    console.log(`Serving onboarding UI from ${frontendDir}`);
  } else {
    app.get("/", (_req, res) =>
      res.json({ service: "atlus-onboarding-api", ok: true }),
    );
  }

  const port = Number(process.env.PORT ?? 4000);
  app.listen(port, () => {
    console.log(`Atlus onboarding API listening on :${port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
