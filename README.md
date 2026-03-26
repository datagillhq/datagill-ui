# datagill-ui

Minimal Next.js App Router frontend for the DataGill search experience.

## Stack

- Next.js
- React
- TypeScript
- shadcn/ui + Radix primitives

## Local development

1. Install Node.js 22+.
2. Start the search service first from `../datagill-core`.
3. Run `npm install`.
4. Start the UI with `npm run dev`.
5. Open `http://localhost:3001`.

The UI fetches search results from `http://localhost:8082` by default. Override with `SEARCH_API_BASE_URL` if needed.

Note:

- `datagill-core` Docker Compose already uses `http://localhost:3000` for Grafana, so the UI intentionally defaults to port `3001` during local development to avoid collisions.

## Docker

Docker is optional for frontend local development. It is useful if you want a reproducible runtime or do not want Node.js installed directly on your machine.

### Run both services together

From the repository root:

1. Install Docker Desktop.
2. Run `docker compose -f compose.local.yml up --build`.
3. Open `http://localhost:3001`.

This starts:

- UI on `http://localhost:3001`
- Search Service on `http://localhost:8082`
