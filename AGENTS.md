# AGENTS.md — DataGill UI Working Agreement

> This file is the UI-side working guide for agents and contributors.
> It should stay aligned with `datagill-core/AGENTS.md` for cross-repo decisions.

## Scope For This Chat

- Focus only on `datagill-ui` and the Search Service in `datagill-core`
- Do not introduce Temporal into the search flow
- Keep the initial frontend intentionally minimal until product flows are clearer

## Current UI Decisions

| Area | Decision |
|------|----------|
| Framework | Next.js App Router |
| Component approach | shadcn-style local component structure |
| Styling | Global CSS for the initial bootstrap |
| Data flow | Server-rendered page fetches from Search Service |
| Search backend target | `http://localhost:8082` by default |

## Current Bootstrap Shape

- One landing page at `/`
- One search interaction that reads a `q` query param
- One server-side fetch path to Search Service `GET /api/v1/search`
- Small reusable UI primitives in `components/ui`
- Fallback demo data when the backend is unavailable during setup

## Near-Term Next Steps

- Replace local primitives with generated shadcn components once Node tooling is installed
- Add a dedicated API client layer when more endpoints land
- Introduce auth-aware requests after Clerk is wired in
- Revisit frontend data fetching strategy after the LLD decision

## Documentation Rule

When a UI design or architecture decision changes, update this file in the same change.
