# Local Development Setup

This guide gets `datagill-ui` running locally for both first-time setup and day-to-day development.

## Quick start

If you have already completed the one-time BetterAuth setup, use these commands:

```bash
# 1. Start the auth database
docker compose up -d auth-db

# 2. Start the Next.js app
npm run dev
```

The app runs at **http://localhost:3001**.
Start this before `datagill-core`, since the backend fetches JWKS from BetterAuth on startup.

If port `3001` is already in use, stop the old process before restarting the app.

---

## First-time setup

### 1. Pull latest changes and install dependencies

```bash
git pull
npm install
```

### 2. Create the local env file

```bash
cp .env.example apps/app/.env.local
```

Fill in the required values in `apps/app/.env.local`:

```bash
# Generate a secret:
openssl rand -base64 32
# Paste the output as BETTER_AUTH_SECRET
```

For local dev, the other defaults from `.env.example` can stay as-is unless you have a custom setup.

### 3. Start the auth database

```bash
docker compose up -d auth-db
```

This starts the BetterAuth Postgres instance on port **5433**.

### 4. Run BetterAuth migrations

Run this from the repo root. The BetterAuth CLI does not load `apps/app/.env.local` automatically, so export it first.

If `packages/auth/server.ts` contains `import "server-only"`, remove it before running the migration and add it back afterward.

```bash
set -a
source apps/app/.env.local
set +a
npx auth@latest migrate --config packages/auth/server.ts
```

### 5. Fix Postgres column types

The BetterAuth CLI may generate SQLite-friendly column types. Convert them to the correct Postgres types with:

```bash
docker compose exec -T auth-db psql -U datagill -d datagill_auth < scripts/fix-auth-postgres-types.sql
```

### 6. Start the app

```bash
npm run dev
```

The app is now at **http://localhost:3001**.
Start it before `datagill-core`.

---

## Required env vars

These belong in `apps/app/.env.local`:

| Variable | Example |
|---|---|
| `DATABASE_URL` | `postgres://datagill:secret@localhost:5433/datagill_auth` |
| `BETTER_AUTH_SECRET` | any random 32+ char string (`openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | `http://localhost:3001` |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8082` |

---

## Re-running migrations

If the BetterAuth schema changes due to a plugin change or version bump:

```bash
set -a
source apps/app/.env.local
set +a
npx auth@latest migrate --config packages/auth/server.ts
docker compose exec -T auth-db psql -U datagill -d datagill_auth < scripts/fix-auth-postgres-types.sql
```

---

## Troubleshooting

### `Invalid environment variables`

The BetterAuth CLI is not reading `apps/app/.env.local`. Export it first:

```bash
set -a
source apps/app/.env.local
set +a
```

### `Cannot find module 'better-auth'`

Workspace dependencies have not been installed yet:

```bash
npm install
```

### `listen EADDRINUSE: address already in use 0.0.0.0:3001`

Another local process is already using port `3001`. Find and stop it:

```bash
lsof -nP -iTCP:3001 -sTCP:LISTEN
kill <pid>
```

### BetterAuth migration succeeded but auth behaves strangely

Make sure the Postgres type-fix step has been run:

```bash
docker compose exec -T auth-db psql -U datagill -d datagill_auth < scripts/fix-auth-postgres-types.sql
```
