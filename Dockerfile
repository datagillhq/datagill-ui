FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Dummy env vars so Next.js build doesn't fail on missing vars.
# Real values are injected at runtime via docker-compose or the host environment.
ENV BETTER_AUTH_SECRET=build-placeholder
ENV BETTER_AUTH_URL=http://localhost:3000
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
