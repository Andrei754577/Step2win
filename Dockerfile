# Production image for Render (or any Docker host)
FROM oven/bun:1.2-slim AS base
WORKDIR /app

# Install deps first (better layer caching)
COPY package.json bun.lock turbo.json ./
COPY packages/web/package.json packages/web/package.json
COPY packages/mobile/package.json packages/mobile/package.json
COPY packages/desktop/package.json packages/desktop/package.json
RUN bun install --frozen-lockfile

# Copy the rest of the source and build the web app (frontend + type-check API)
COPY . .
RUN cd packages/web && bun run build

ENV NODE_ENV=production
EXPOSE 3000

# server.ts serves the built frontend (packages/web/dist) and the Hono API
# from a single Bun process — this is the same script used in local `bun run start`.
CMD ["bun", "packages/web/src/server.ts"]
