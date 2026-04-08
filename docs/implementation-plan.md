# datagill-ui — Frontend Implementation Plan

This document covers every PR needed to go from the current minimal bootstrap to a production-ready UI. Read alongside `AGENTS.md` (stack decisions, conventions) and `datagill-core/AGENTS.md` (backend API contracts).

---

## Progress — as of 2026-04-07

| PR | Description | Status |
|---|---|---|
| #8 | F.0c: shadcn/ui init, Vitest + Playwright scaffolding | ✅ Merged |
| #9 | Monorepo restructure: `apps/app/src/` + `packages/auth/` | ✅ Merged |
| #10 | Next.js 15 CVE upgrades (11 advisories) | ✅ Merged |
| #11 | F.1: `apiFetch`, env validation, TanStack Query | ✅ Merged |
| #12 | F.2: BetterAuth email/password, RS256 JWT, middleware, auth pages | ✅ Merged |
| #13 | Docs: frontend code review checklist in AGENTS.md | ✅ Merged |
| #17 | F.4: Static provider catalog + useSupportedProviders hook | ✅ Merged |
| #19 | F.3: Onboarding layout + Step 1 (Create Org) | ✅ Merged |

**Next up:** F.5 (Integration Modal) — unblocked. F.6 (Onboarding Step 2) depends on F.5.

---

## Deviations from Original Plan

- **Monorepo layout** — Added `packages/auth/` workspace before F.2 so `better-auth` is never imported directly from app code. All auth logic is encapsulated behind `@datagill/auth/{client,server,provider,keys}`.
- **F.2 scope reduced** — Email/password only for MVP. Google and GitHub OAuth deferred (no client IDs yet). Invitation plugin also deferred to F.7.
- **BetterAuth JWT verified** — `organizationId` claim works via `definePayload` on the `jwt()` plugin. RS256 + `jwksPath: "/.well-known/jwks.json"` confirmed compatible with datagill-core's validator. The blocking pre-check in F.2 is resolved.
- **`apps/app` dev port is 3001** — not 3000 as originally planned (3000 conflicts with datagill-core locally).

---

## Parallelization Overview

After F.0 lands, three tracks can run independently. A team of 3–4 can execute this in parallel.

```
F.0 (Repo setup — sequential foundation)
│
├── F.1 (API client, env, TanStack Query)   ← Person 1
└── F.2 (BetterAuth pages + middleware)     ← Person 2
         │
         ▼ (both F.1 + F.2 must land)
         │
         ├── TRACK A: Onboarding ─────────────────────────────────┐
         │   F.3 Onboarding layout + Step 1                       │
         │   └── F.6 Onboarding Step 2 (needs F.3 + F.5)         │
         │       └── F.7 Onboarding Step 3 + Step 4              │
         │                                                        │
         ├── TRACK B: Integrations / Settings ────────────────────┤
         │   F.4 Provider catalog                                 │
         │   ├── F.5 Integration Modal  ──── merges into F.6 ────┘
         │   └── F.8 Provider card (parallel with F.5)
         │       └── F.9 Settings page: load + connect
         │           └── F.10 Settings: configure + toggle + disconnect
         │
         └── TRACK C: Dashboard ──────────────────────────────────
             F.11 Dashboard layout + global filters
             ├── F.12 Audit Log + pagination (parallel with F.13)
             └── F.13 Top Teams (parallel with F.12)
                 └── F.14 Launched Wins + Velocity
                          ⚠ blocked on backend rollout_percentage
```

**Merge point:** F.6 (Onboarding Step 2) requires both F.3 (Track A) and F.5 (Track B). Coordinate so those land before F.6 is started.

---

## Mocks First

**Before writing layout or styling code for any PR, ask the user for a mock or design reference.** The implementation plan describes behavior and data — it does not define visual layout, spacing, or component variants.

Exception: F.0 and F.1 have no user-visible UI and do not need a mock.

---

## PR Sequence

### F.0 — Repo Setup & Agent Init
**~100 lines | No dependencies | Do this first, everyone blocked until it lands**

Sets up tooling, CI, git hooks, and AGENTS.md so every agent and contributor starts from the same baseline.

- **Tooling**
  - Biome (`biome.jsonc`) — replaces ESLint + Prettier, one tool for lint + format
  - Lefthook (`.lefthook.yml`) — git hooks: pre-commit runs `biome check`, pre-push runs `tsc --noEmit`
  - TypeScript strict config at root
  - `@t3-oss/env-nextjs` + Zod for type-safe env validation (`src/lib/env.ts`)

- **Docker (BetterAuth self-hosted)**
  - Update `Dockerfile` to use multi-stage build with Bun
  - Add `docker-compose.yml`:
    - `app` service: Next.js on port 3000
    - `auth-db` service: Postgres 16 on port 5433 (separate from datagill-core's app-postgres)
  - BetterAuth runs embedded in the Next.js app (`app/api/auth/[...all]/route.ts`) and uses `auth-db` as its data store

- **GitHub**
  - `.github/workflows/ci.yml` — typecheck + lint + build on every PR
  - `.github/PULL_REQUEST_TEMPLATE.md`

- **shadcn/ui init**
  - Initialize shadcn config
  - Install core components upfront: `button dialog input badge card skeleton dropdown-menu avatar table tabs separator toast`

- **`.env.example`** — all variables documented, secrets blank

```bash
# BetterAuth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=postgres://datagill:secret@localhost:5433/datagill_auth

# Social OAuth (optional for dev)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# DataGill Backend
NEXT_PUBLIC_API_URL=http://localhost:8082
```

---

### F.1 — API Client, Env Validation, TanStack Query
**~120 lines | Depends on: F.0 | Parallel with: F.2**

- `src/lib/env.ts` — validated env schema using `@t3-oss/env-nextjs`
- `src/lib/api.ts` — fetch wrapper that reads BetterAuth session token and attaches `Authorization: Bearer <token>` on every DataGill request; maps backend error codes to typed errors
- `src/lib/query-client.ts` — TanStack Query client config (stale time, retry policy)
- `src/app/layout.tsx` update — wrap with `<QueryClientProvider>`

---

### F.2 — BetterAuth: Config, Sign-Up, Sign-In
**~130 lines | Depends on: F.0 | Parallel with: F.1**

⚠ **Critical pre-check before coding:** Verify BetterAuth's JWT plugin emits `organizationId` (the user's `activeOrganizationId`) as a claim. DataGill's backend validates this claim on every request — if it's missing, all API calls will 401. Document the exact config in `auth.ts` once confirmed.

- `src/lib/auth.ts` — BetterAuth config:
  - Postgres adapter pointing at `auth-db`
  - Plugins: `organization()`, `jwt()` (must include `organizationId` claim), `invitation()`
  - Social providers: Google, GitHub
- `src/app/api/auth/[...all]/route.ts` — BetterAuth API route handler
- `src/middleware.ts` — session guard; redirects unauthenticated users to `/sign-in`; protects `/(app)/*` routes
- `src/app/(auth)/sign-up/page.tsx` — sign-up form (name, email, password, Google/GitHub SSO)
- `src/app/(auth)/sign-in/page.tsx` — sign-in form

---

### F.3 — Onboarding Layout + Step 1 (Create Org)
**~120 lines | Depends on: F.1 + F.2 | Track A**

- `src/app/(app)/onboarding/layout.tsx` — sidebar showing 5 steps (Organization → Integrations → Verification → Team Members → Billing) with checkmarks and current-step highlight. Steps are not freely navigable — forward-only with Back available.
- `src/app/(app)/onboarding/step-1/page.tsx` — Create Org form:
  - Fields: Organization Name, Workspace Slug (auto-generated from name, editable, shown as `datagill.io/[slug]`)
  - On submit: calls BetterAuth `createOrganization()` → receives `externalOrgId`
  - On success: navigate to Step 2
  - Note: DataGill has no org creation endpoint — the org record is created lazily when the first integration is saved in Step 2

---

### F.4 — Static Provider Catalog
**~80 lines | Depends on: F.1 | Track B | Parallel with: F.3**

- `src/lib/providers.ts` — static catalog of all providers with metadata:
  ```ts
  type Provider = {
    id: string           // 'launchdarkly', 'unleash', 'flagsmith', 'sentry', ...
    name: string
    logo: string         // asset path
    description: string
    docsLink: string     // "Launch Account Settings → Access Tokens"
    tags: string[]       // ['DEVOPS', 'RECOMMENDED']
  }
  ```
- `src/hooks/use-supported-providers.ts` — fetches `GET /v1/integrations/providers`, merges with static catalog to determine which providers are active vs. "Coming Soon". Unimplemented providers show Coming Soon with Connect disabled. New providers enabled by backend deploy — no frontend change needed.

---

### F.5 — Integration Connection Modal
**~150 lines | Depends on: F.4 | Track B**

Shared component used in both Onboarding Step 2 and Settings/Integrations page. Same API calls, `onSuccess` differs by context.

```ts
type IntegrationModalProps = {
  mode: 'create' | 'edit'
  provider: Provider
  existingIntegrationKey?: string
  onSuccess: (integration: Integration) => void
  onCancel: () => void
}
```

States: `idle → saving → success → error`

- **Create mode:** `POST /v1/integrations` — validation is part of the save (no separate pre-flight call)
- **Edit mode:** `PUT /v1/integrations/{key}` — if user leaves key field untouched, omit `apiKey` from request body; backend keeps existing key. If user clicks into the masked field, clear it to signal replacement intent.
- On success: green checkmark shown near API key field → modal closes → `onSuccess(integration)` called
- On failure: inline error below field mapped from backend error code:

| Code | Display |
|---|---|
| `INTEGRATION_INVALID_API_KEY` | "Invalid API key. Please check your account settings." |
| `INTEGRATION_PROVIDER_UNREACHABLE` | "Could not reach the provider. Please try again." |
| `INTEGRATION_DUPLICATE_PROVIDER` | "An integration for this provider is already connected." |

---

### F.6 — Onboarding Step 2 (Connect Integrations)
**~120 lines | Depends on: F.3 + F.5 | Merge point of Track A + B**

- `src/app/(app)/onboarding/step-2/page.tsx`
  - Provider grid using static catalog cross-referenced with `use-supported-providers`
  - Search and category filter operate on static catalog — no API call
  - Clicking a provider opens `<IntegrationModal mode="create">` as an overlay
  - On modal success: card shows connected state, footer count updates
  - Footer: "X tool(s) selected", "Skip for now" (advances to Step 4), "Continue to Verification" (enabled once ≥1 connected)

---

### F.7 — Onboarding Step 3 (Verification) + Step 4 (Invite Team)
**~100 lines | Depends on: F.6 | Track A**

- `src/app/(app)/onboarding/step-3/page.tsx` — confirmation screen showing connected integrations and status from local state (no new API calls)
- `src/app/(app)/onboarding/step-4/page.tsx`
  - Multi-email input (tag-style)
  - On submit: calls BetterAuth `inviteMember()` → sends invitation emails (7-day expiry)
  - "Already invited" list with role badges (Admin, Editor, Viewer)
  - On finish: redirect to `/dashboard`

---

### F.8 — Provider Card Component
**~80 lines | Depends on: F.4 | Parallel with: F.5**

Four visual variants driven by `GET /v1/integrations` × provider catalog:

| State | Condition |
|---|---|
| Connected, active | In `GET /v1/integrations`, `state: active` — toggle on, Configure button |
| Connected, paused | In `GET /v1/integrations`, `state: paused` — toggle off, Configure button |
| Not connected (supported) | Not in integrations, in providers list — Connect button |
| Coming soon | Not in providers list — grayed out, disabled |

---

### F.9 — Settings/Integrations Page: Load + Connect
**~120 lines | Depends on: F.5 + F.8 | Track B**

`/settings/integrations`

- Two parallel fetches on load: `GET /v1/integrations` + `GET /v1/integrations/providers` — merged with static catalog
- Skeleton cards while loading
- Connect action: opens `<IntegrationModal mode="create">`, on success calls `addToIntegrationList(integration)`
- Filters: All / Live / by category tag — all operate on loaded data, no re-fetch

---

### F.10 — Settings/Integrations: Configure + Toggle + Disconnect
**~120 lines | Depends on: F.9 | Track B**

- **Configure:** opens `<IntegrationModal mode="edit">` with key masked, on success calls `updateIntegrationInList(integration)`
- **Toggle pause/resume:** `PUT /v1/integrations/{key}` with `{ state: "paused" | "active" }`. Optimistic update — flip toggle immediately, revert on error. No modal.
- **Disconnect:** confirmation dialog ("Disconnecting stops syncing. Historical data is retained.") → `DELETE /v1/integrations/{key}` → remove card from connected list, provider returns to not-connected state

---

### F.11 — Dashboard Layout + Global Filters
**~120 lines | Depends on: F.1 + F.2 | Track C | Parallel with: F.3 + F.4**

`/dashboard`

- Page shell with skeletons for all 4 sections
- Global filter bar: date range picker (default: last 7 days; options: 7d, 30d, 90d, custom), Team dropdown, Person dropdown
- Filter dropdowns populated from analytics response data — no extra endpoint
- On filter change: all sections re-fetch in parallel (TanStack Query `useQueries`), show skeletons during refetch
- Sections fail independently — one error doesn't block others

---

### F.12 — Dashboard: Audit Log
**~120 lines | Depends on: F.11 | Parallel with: F.13**

`GET /v1/analytics?metric=audit_log&from=&to=&page=&limit=25`

- Persistent at bottom of dashboard — always visible, gives meaningful content when headline metrics have no data
- Columns: timestamp, flag name + external link icon (→ `sourceUrl`), actor (Gravatar / initials fallback), event type, environments
- Pagination: page-based, independent from global date filter changes
- Empty state: "No activity recorded in this period."

---

### F.13 — Dashboard: Top Teams
**~100 lines | Depends on: F.11 | Parallel with: F.12**

`GET /v1/analytics?metric=top_teams&from=&to=`

- 2×3 grid, up to 6 teams
- Each card: team name, change count, active member count
- Empty state: "No team activity in this period."

---

### F.14 — Dashboard: Launched Wins + Deployment Velocity
**~130 lines | Depends on: F.12 + F.13 | ⚠ Blocked on backend**

⚠ **Blocked until `rollout_percentage` and `actor_name` land in the backend data model.** Do not start this PR until that backend change is confirmed shipped.

**Launched Wins** — `GET /v1/analytics?metric=launched_wins&from=&to=`
- Table: flag name + external link icon, actor name + Gravatar/initials avatar, rollout % badge (100% = launched, 1–99% = partial), date
- Empty state: "No flags reached 100% rollout in this period."

**Deployment Velocity** — `GET /v1/analytics?metric=velocity&from=&to=`
- Single card: average time formatted as "Xm" / "Xh Ym" / "X days"
- Subtext: "based on N flags" — show disclaimer when `sampleSize < 3`
- Empty state: "Not enough data — no flags completed full rollout in this period."

---

## Testing Per PR

Every PR must include tests. The table below specifies what kind of tests belong in each PR. See `AGENTS.md §6` for the full testing philosophy and tooling setup.

| PR | Unit (Vitest) | Component (@testing-library) | E2E (Playwright) | Visual (Claude in Chrome) |
|---|---|---|---|---|
| F.0 | — | — | — | — |
| F.1 | `api.ts` error mapping, request construction | — | — | — |
| F.2 | — | Sign-up form validation states | Sign-up → sign-in flow | Screenshot sign-up + sign-in pages |
| F.3 | — | Onboarding sidebar step states | Navigate through Step 1, create org | Screenshot sidebar progress |
| F.4 | Catalog filter logic, Coming Soon derivation | — | — | — |
| F.5 | — | Modal: all 4 states × all 3 error codes, masked key edit behavior | — | Screenshot each modal state |
| F.6 | — | Provider grid: connected vs unconnected states, footer count | Connect integration in onboarding end-to-end | Screenshot provider grid + connected card state |
| F.7 | — | Invite email tag input | Complete full onboarding wizard | Screenshot verification screen + invite step |
| F.8 | — | All 4 card variants render correctly | — | Screenshot each card variant |
| F.9 | — | Settings page: skeleton → loaded state | Load settings page, connect a new integration | Screenshot merged catalog |
| F.10 | — | Toggle revert on error | Pause/resume toggle; disconnect with confirmation | Screenshot optimistic toggle flip |
| F.11 | Date range formatting, filter AND logic | Filter bar: date picker, dropdowns | Dashboard loads, all 4 skeletons visible | Screenshot dashboard shell + filter bar |
| F.12 | — | Audit log: empty state, pagination controls | Paginate audit log; change date range re-fetches | Screenshot audit log table |
| F.13 | — | Top teams: empty state | Top teams loads with real data | Screenshot top teams grid |
| F.14 | Velocity time formatter (m/h/days) | Launched wins: partial badge; velocity: `sampleSize < 3` disclaimer | Full dashboard with all 4 sections populated | Screenshot complete dashboard |

### F.0 Testing Setup

F.0 must scaffold the test infrastructure so all subsequent PRs can immediately write tests:

- Install and configure **Vitest** with jsdom environment
- Install **@testing-library/react** + `@testing-library/user-event`
- Install **Playwright**, add `playwright.config.ts` pointing at `localhost:3000`
- Add `npm run test`, `npm run test:e2e`, `npm run test:e2e:ui` scripts
- Add Playwright to CI (`ci.yml`): start dev server, run `test:e2e`
- Add `tests/` directory with a placeholder test so CI doesn't fail on a empty suite

---

## Blocking Dependencies Summary

| Blocker | Blocks |
|---|---|
| BetterAuth JWT `organizationId` claim verified | F.2, and all PRs that call DataGill API |
| F.0 landed | Everything |
| F.1 + F.2 both landed | F.3, F.4, F.11 (and their downstream) |
| Backend `rollout_percentage` + `actor_name` shipped | F.14 |

---

## What Is Explicitly Out of Scope

- **Flag audit detail page** — users link to source provider via `sourceUrl`. Do not build this.
- **AI summary** — not in MVP.
- **`/v1/analytics?metric=velocity` and `metric=launched_wins`** sections — until backend data model change ships.
- **Billing step (Onboarding Step 5)** — out of scope.
- **Stale Error badge on integration cards** — deferred, not MVP.
