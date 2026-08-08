FROM oven/bun:1-slim
WORKDIR /app

COPY backend/package.json backend/bun.lock ./backend/
RUN cd backend && bun install --production

COPY backend ./backend
COPY frontend ./frontend

ENV PORT=4000
EXPOSE 4000
WORKDIR /app/backend

# One-time setup (run once per new database, not on every boot):
#   docker run --rm -e DATABASE_URL=... <image> bun run scripts/migrate.ts
#   docker run --rm -e DATABASE_URL=... <image> bun run scripts/load-iptc.ts
#   docker run --rm -e DATABASE_URL=... <image> bun run scripts/seed-sources.ts
CMD ["bun", "run", "src/server.ts"]
