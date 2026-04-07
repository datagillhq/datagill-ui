FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# BETTER_AUTH_SECRET and BETTER_AUTH_URL must NOT be hardcoded here —
# they are runtime values and must be injected via docker-compose env_file
# or host environment. Hardcoding BETTER_AUTH_URL would bake the wrong
# callback URL into the client bundle and break OAuth redirects.
#
# NEXT_PUBLIC_API_URL is a build-time value (inlined into the JS bundle by
# Next.js at build time), so a placeholder is acceptable here. Override it
# at build time in CI or your deployment pipeline if targeting a real backend.
ENV NEXT_PUBLIC_API_URL=http://localhost:8082
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# standalone output contains only what's needed to run the server —
# no node_modules, no source files.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3001
ENV PORT=3001
CMD ["node", "server.js"]
