# datagill-ui

Frontend for the DataGill product experience.

This repo owns the customer-facing web app: landing experience, auth surfaces, app shell, search workflows, timeline views, and future dashboard UX for DataGill.

## What DataGill Is

DataGill helps engineering teams understand what changed, who changed it, and whether it mattered.

The backend ingests feature flag and related operational data into a normalized model. This frontend turns that data into workflows people can actually use:

- investigate recent changes
- search and inspect flags
- understand ownership and activity
- onboard teams into the product

## Stack

- Next.js App Router
- React
- TypeScript
- shadcn/ui + Radix primitives
- Tailwind CSS v4

## Local Development

```bash
cd datagill-ui
npm install
npm run dev
```

Open `http://localhost:3001`.

### Full local stack with Docker

From the repository root:

```bash
docker compose -f compose.local.yml up --build
```

This starts:

- UI on `http://localhost:3001`
- Search Service on `http://localhost:8082`

## Configuration

The UI talks to the search service at `http://localhost:8082` by default.

Use `SEARCH_API_BASE_URL` to point the frontend at a different backend.

Notes:

- `datagill-core` uses `http://localhost:3000` for Grafana in local Docker compose.
- The UI intentionally defaults to `3001` to avoid port collisions.
- Start backend services from `../datagill-core` when you want real data instead of a UI-only session.

## Frontend Direction

Current frontend priorities:

- establish the app shell and navigation model
- define auth and onboarding direction before implementation
- keep a clean, reusable component system
- add observability and analytics intentionally instead of as an afterthought

See [`AGENTS.md`](./AGENTS.md) for the detailed source of truth on frontend architecture, auth direction, observability, analytics, and AI-agent subtasking guidance.
