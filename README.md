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

1. **Copy env file** and fill in values (ask a teammate for the secret):
   ```bash
   cp apps/app/.env.local.example apps/app/.env.local
   ```

2. **Start datagill-core** (search service + app postgres):
   ```bash
   cd ../datagill-core && make docker-up
   ```

3. **Start the auth database** (BetterAuth runs inside Next.js but needs its own postgres on port 5433):
   ```bash
   docker compose up auth-db -d
   ```

4. **Install dependencies and start the UI**:
   ```bash
   npm install && npm run dev
   ```

5. Open `http://localhost:3001`.

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

## License

[Apache License 2.0](./LICENSE).
