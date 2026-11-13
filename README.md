# datagill-ui

Minimal Next.js App Router frontend for the DataGill search experience.

## Stack

- Next.js
- React
- TypeScript
- Local shadcn-style component structure

## Local development

### Prerequisites

- Node.js 22+
- Docker Desktop

### Setup

The backend lives in a separate repo, [datagill-core](https://github.com/datagillhq/datagill-core).
These steps assume it is cloned next to this one as `../datagill-core`. Start the UI first:
the backend fetches signing keys (JWKS) from BetterAuth, which runs inside this app, and its
search service exits if it can't reach them.

1. **Copy the env file** and set `BETTER_AUTH_SECRET` (generate one with `openssl rand -base64 32`):
   ```bash
   cp .env.example apps/app/.env.local
   ```

2. **Start the auth database** (BetterAuth runs inside Next.js but needs its own Postgres on port 5433):
   ```bash
   docker compose up auth-db -d
   ```

3. **Install dependencies and start the UI**:
   ```bash
   npm install && npm run dev
   ```

4. **Start datagill-core** (search service, worker, app Postgres, Temporal). See its README for
   the one-time setup (`.env`, migrations):
   ```bash
   cd ../datagill-core && make docker-up
   ```

5. Open `http://localhost:3001`.

See [LOCALSETUP.md](./LOCALSETUP.md) for the full guide.

### Ports

| Service | URL |
|---|---|
| Next.js (UI + BetterAuth) | http://localhost:3001 |
| Search service | http://localhost:8082 |
| Auth postgres | localhost:5433 |
| App postgres | localhost:5432 |

### Rebuilding the search service

After pulling changes to `datagill-core`:
```bash
cd ../datagill-core && docker compose up --build search -d
```
