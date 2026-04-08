# AGENTS.md — DataGill UI

> This file is the single source of truth for architecture decisions, stack choices, and working conventions for `datagill-ui`.
> Read this before starting any task. Do not implement anything that contradicts this file without updating it first.
> Keep aligned with `datagill-core/AGENTS.md` for cross-repo API contracts and backend decisions.

---

## 0. Product Scope

DataGill UI is the web frontend for the DataGill platform. It connects to two backend services in `datagill-core`:

- **Integration Management API** (`/v1/integrations/*`) — integration CRUD
- **Analytics API** (`/v1/analytics?metric=...`) — dashboard metrics

For the full backend API contracts, read `datagill-core/docs/backend/integration-management-api.md` and `datagill-core/docs/backend/analytics-api.md`.

### What Is NOT in Scope

| Item | Reason |
|---|---|
| Flag audit detail page | Users link to source provider via `sourceUrl`. Do not build. |
| AI summary | Post-MVP |
| Launched Wins + Velocity dashboard sections | Blocked on backend `rollout_percentage` data model change |
| Billing (Onboarding Step 5) | Out of scope |
| Stale Error badge on integration cards | Deferred, not MVP |

---

## 1. Tech Stack

| Area | Decision | Notes |
|---|---|---|
| Framework | Next.js 15 (App Router) | Already bootstrapped |
| Components | shadcn/ui | Installed during F.0 |
| Styling | Tailwind CSS v4 | Via shadcn |
| Data fetching | TanStack Query | `useQueries` for parallel dashboard fetches; optimistic updates for toggle |
| Auth | BetterAuth (self-hosted) | See §2 |
| Lint + format | Biome | Replaces ESLint + Prettier. Run `biome check`. Do not add ESLint rules. |
| Package manager | npm workspaces | Monorepo root at `datagill-ui/`. Do not switch to Bun without a dedicated migration PR. |
| Type safety | TypeScript strict | `tsc --noEmit` must pass on every PR |
| Env validation | `@t3-oss/env-nextjs` + Zod | All env vars declared in `apps/app/src/lib/env.ts` |

---

## 2. Repository Structure

```
datagill-ui/                        ← workspace root
├── apps/
│   └── app/                        ← Next.js app (@datagill/app)
│       ├── src/
│       │   ├── app/
│       │   │   ├── (auth)/         ← public: /sign-in, /sign-up
│       │   │   ├── (app)/          ← protected: /dashboard, /onboarding/*, /settings/*
│       │   │   │   ├── dashboard/
│       │   │   │   ├── onboarding/
│       │   │   │   └── settings/integrations/
│       │   │   ├── api/auth/[...all]/route.ts  ← BetterAuth handler
│       │   │   ├── globals.css
│       │   │   └── layout.tsx
│       │   ├── components/
│       │   │   ├── ui/             ← shadcn primitives (generated — do not hand-edit)
│       │   │   └── shared/         ← IntegrationModal, ProviderCard, etc.
│       │   ├── lib/
│       │   │   ├── api.ts          ← fetch wrapper with JWT injection (F.1)
│       │   │   ├── providers.ts    ← static provider catalog (F.4)
│       │   │   ├── query-client.ts ← TanStack Query client (F.1)
│       │   │   └── env.ts          ← @t3-oss/env-nextjs schema (F.1)
│       │   ├── hooks/
│       │   └── middleware.ts       ← BetterAuth session guard (F.2)
│       ├── __tests__/              ← Vitest unit + component tests
│       ├── e2e/                    ← Playwright E2E tests
│       ├── public/
│       ├── components.json         ← shadcn config
│       ├── next.config.ts
│       ├── package.json            ← app deps (@datagill/app)
│       ├── postcss.config.mjs
│       ├── tailwind.config.ts
│       ├── tsconfig.json           ← extends ../../tsconfig.json, @/* → ./src/*
│       ├── vitest.config.ts
│       ├── vitest.setup.ts
│       └── playwright.config.ts
├── packages/
│   └── auth/                       ← BetterAuth abstraction (@datagill/auth)
│       ├── client.ts               ← "use client" — useSession, signIn, signOut
│       ├── server.ts               ← "server only" — getSession, auth handler config
│       ├── provider.tsx            ← <SessionProvider> wrapper
│       ├── keys.ts                 ← Zod env validation for auth vars
│       └── package.json            ← @datagill/auth
├── docs/
│   └── implementation-plan.md
├── scripts/
│   └── check-lockfile.js
├── .github/
│   ├── workflows/ci.yml
│   └── PULL_REQUEST_TEMPLATE.md
├── AGENTS.md                       ← you are here
├── CLAUDE.md
├── biome.jsonc                     ← lint + format (applies to whole repo)
├── .lefthook.yml
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── package.json                    ← workspace root (workspaces: apps/*, packages/*)
└── tsconfig.json                   ← base TypeScript config (extended by each package)
```

### Import rules

- `@/*` resolves to `apps/app/src/*` — use this for all in-app imports
- Auth: always import from `@datagill/auth/client`, `@datagill/auth/server`, or `@datagill/auth/provider` — never import from `better-auth` directly
- Do not import between `apps/` — only `packages/` are shared

---

## 3. Auth — BetterAuth (Self-Hosted)

BetterAuth runs **embedded in the Next.js app** as an API route handler at `apps/app/src/app/api/auth/[...all]/route.ts`. It is not a separate process. Its data (users, sessions, accounts) lives in a dedicated Postgres instance (`auth-db`) defined in `docker-compose.yml`.

All auth abstractions live in `packages/auth/` — this is the only place in the repo that imports from `better-auth`. If we ever swap auth providers, it is a one-package change.

### Docker Services

```yaml
# docker-compose.yml
services:
  app:               # Next.js + BetterAuth embedded — port 3001
  auth-db:           # Postgres 16 for BetterAuth — port 5433
```

`auth-db` is separate from `datagill-core`'s `app-postgres`. Do not mix them.

### Configuration

`packages/auth/server.ts` (implemented in F.2):
- Adapter: Postgres pointing at `auth-db`
- Plugins: `organization()`, `jwt()`, `invitation()`
- Social providers: Google, GitHub

### JWT Requirement (Critical)

BetterAuth's JWT plugin **must** emit `organizationId` (the user's `activeOrganizationId`) as a claim. DataGill's backend validates this claim on every request — if it's missing, all API calls return 401.

**Verify this before starting F.2.** Document the exact plugin config in `packages/auth/server.ts` once confirmed.

### Ownership Boundary

| Concern | Owner |
|---|---|
| User creation, sessions, sign-in | BetterAuth |
| Org creation (name + slug) | BetterAuth |
| Team invitations, roles | BetterAuth |
| Integration CRUD | DataGill API |
| Org record in DataGill DB | DataGill (created lazily on first `POST /v1/integrations`) |

### Middleware

`apps/app/src/middleware.ts` guards all routes under `/(app)/*`. Unauthenticated requests redirect to `/sign-in`.

### Route Groups

| Group | Path | Access |
|---|---|---|
| `(auth)` | `/sign-in`, `/sign-up` | Public |
| `(app)` | `/dashboard`, `/onboarding/*`, `/settings/*` | Requires session |

---

## 4. API Conventions

All DataGill API calls go through `apps/app/src/lib/api.ts`. **Do not call `fetch` directly from pages or components.**

- Attaches `Authorization: Bearer <token>` from BetterAuth session on every request
- Backend returns error codes, not messages: `{ "code": "INTEGRATION_INVALID_API_KEY" }` — map to display strings in the frontend
- `NEXT_PUBLIC_API_URL` is the base URL for all DataGill requests (default: `http://localhost:8082`)

### Error Code Mapping

| Code | Display |
|---|---|
| `INTEGRATION_INVALID_API_KEY` | "Invalid API key. Please check your account settings." |
| `INTEGRATION_PROVIDER_UNREACHABLE` | "Could not reach the provider. Please try again." |
| `INTEGRATION_DUPLICATE_PROVIDER` | "An integration for this provider is already connected." |
| `INTEGRATION_NOT_FOUND` | Integration not found. |
| `ANALYTICS_UNKNOWN_METRIC` | Unknown metric. |

---

## 5. Provider Catalog

The full list of providers (name, logo, description, tags, docsLink) lives statically in `apps/app/src/lib/providers.ts`. The backend is not the source of truth for the catalog.

`GET /v1/integrations/providers` returns the list of **implemented** provider IDs. The frontend cross-references this to show "Coming Soon" on unimplemented providers. A backend deploy alone can enable a new provider — no frontend change needed.

---

## 6. Mocks Required Before Coding

**Before writing any UI code for a page or component, ask the user for a mock or design reference.**

Mocks are the source of truth for layout, spacing, component variants, interaction states, and copy. Do not invent layout decisions from the implementation plan alone — it describes behavior and data, not visual design.

When starting a PR, ask:

> "Do you have a mock or design file for [page/component]? I need it before writing any layout or styling code."

If the user provides a Figma link, screenshot, or sketch — refer to it throughout the PR and call out any ambiguities before coding rather than guessing. If no mock exists yet, flag this as a blocker and do not proceed with layout code.

Exception: purely structural PRs (F.0, F.1) that have no user-visible UI do not need a mock.

---

## 7. Testing

### Tools

| Tool | Purpose |
|---|---|
| Vitest | Unit tests — pure functions, data transforms, error code mapping |
| @testing-library/react | Component tests — render, interact, assert on DOM |
| Playwright | E2E tests — full user journeys in a real browser |
| Claude in Chrome | Visual verification during development — agents take screenshots and interact with `localhost` |

### What to Test at Each Layer

**Unit tests (Vitest)** — fast, no DOM needed:
- `apps/app/src/lib/api.ts` — error code mapping, request construction
- `apps/app/src/lib/providers.ts` — catalog filtering, Coming Soon logic
- Time formatting utilities (velocity "Xm / Xh Ym / X days")
- Any pure data transform

**Component tests (@testing-library/react)** — render in jsdom:
- `IntegrationModal` — all four states (idle, saving, success, error), each error code
- `ProviderCard` — all four visual variants
- Dashboard sections — empty states, loading skeletons, data display
- Filter dropdowns — AND logic when both team + actor are active

**E2E tests (Playwright)** — run against the real dev server:
- Sign-up → onboarding → dashboard happy path
- Integration connect flow (modal open → verify → save → card updates)
- Toggle pause/resume (optimistic update + revert on error)
- Disconnect with confirmation dialog
- Dashboard date range filter causes all sections to re-fetch
- Audit log pagination

### Running Tests

```bash
npm run test          # Vitest unit + component tests (delegates to apps/app)
npm run test:e2e      # Playwright E2E (requires dev server running)
```

### Visual Verification with Claude in Chrome

Agents working on UI changes should use Claude in Chrome to visually verify their work before opening a PR:

```bash
# Start dev server in one terminal
npm run dev

# In Claude Code, enable Chrome and ask it to verify
# Example: "Open localhost:3001/onboarding, go through step 2,
# connect a LaunchDarkly integration, and screenshot the result"
```

### Testing Philosophy

- All meaningful code paths must have a test
- No redundant tests — don't test the same thing twice at different layers
- Component tests cover state machines exhaustively (every modal state, every card variant)
- E2E tests cover user journeys, not implementation details
- Do not mock the DataGill API in E2E tests — use a test environment or MSW for deterministic responses

---

## 8. PR Rules

- Max **100–150 lines** of changed code per PR — split if larger
- All changes via branch + PR — no direct pushes to `main`
- Branch prefix: `feat/`, `fix/`, `chore/`
- All PRs use the `.github/PULL_REQUEST_TEMPLATE.md`

### Before Every Push — Run This Locally

CI minutes cost money. Catch failures locally before pushing:

```bash
npm run check   # Biome lint + format + tsc --noEmit
```

The pre-push Lefthook hook runs `typecheck`, `lint`, and a lockfile sync check automatically on `git push`. If any fail, the push is blocked. Fix the issue and push again — do not bypass with `--no-verify`.

### Biome Fixes Must Be Committed

`npm run check` writes fixes to disk but does not stage them. CI checks out from git — if fixed files are not committed, CI sees the originals and fails even though your local check passed.

After running `npm run check`, always check for unstaged changes:

```bash
git diff --name-only   # shows files Biome modified but didn't stage
git add -p             # review and stage the Biome fixes
```

### Lockfile Rule — Most Common CI Failure

CI uses `npm ci`, which hard-fails if `package-lock.json` is out of sync with `package.json`. **Any time you touch any `package.json` in the workspace:**

```bash
npm install                  # regenerates package-lock.json
git add package-lock.json    # commit it in the same commit
```

Never commit a `package.json` change without the updated lockfile alongside it.

---

## 9. Frontend Code Review Checklist

A backend engineer's guide to reviewing Next.js PRs. Most backend instincts apply — here's how they map.

### Security
- **Open redirect** — any `router.push(param)` or `redirect(param)` where the value comes from a URL query string must be validated. Only allow paths that start with `/` and not `//` (which browsers treat as protocol-relative).
- **Server vs client boundary** — check that secrets, tokens, and internal data are never in `"use client"` components. Anything in a client component is shipped to the browser as JS.
- **`dangerouslySetInnerHTML`** — treat like `innerHTML`: never use with unsanitised user content.

### State and data fetching
- **Form double-submit** — buttons must be `disabled` while a request is in flight. The equivalent of backend idempotency keys.
- **staleTime / caching** — `useQuery` with no `staleTime` refetches on every focus. Ask: is this data being fetched more often than it changes?
- **N+1 fetches** — a list that fetches detail for each item in a `useEffect` is the frontend equivalent of an N+1 query.

### Next.js specifics
- **Server component by default** — if a component doesn't use hooks, event handlers, or browser APIs, it should be a server component (no `"use client"`). Client components increase bundle size.
- **`useSearchParams()` needs Suspense** — any component calling `useSearchParams()` must be wrapped in `<Suspense>` or Next.js will fail the static build.
- **Env var placement** — server-only env vars belong in `packages/auth/keys.ts` or server components only. If a secret appears in a `"use client"` file it will be in the browser bundle.
- **Hydration mismatches** — server and client must render identically on first paint. Exceptions (like theme class from `localStorage`) require `suppressHydrationWarning` scoped to the specific element.

### Resource lifecycle
- **Singleton expensive resources** — database pools, HTTP clients, and similar should be module-level singletons. Initialising them inside a function that runs on every request (or every hot-reload) causes connection exhaustion.
- **Middleware cost** — Next.js middleware runs on every matching request. A DB call in middleware is a DB round-trip per page load. Prefer cookie/JWT validation (no DB) in middleware; do full session hydration in route handlers or server components.

### Package boundaries
- `packages/auth/keys.ts` uses `@t3-oss/env-core` — not `env-nextjs`. Use `env-nextjs` only inside `apps/app/` where Next.js `NEXT_PUBLIC_` prefix handling is needed.
- Each env var should be validated in exactly one place. If `BETTER_AUTH_SECRET` is in both `env.ts` and `keys.ts`, one of them is wrong.

---

## 11. Implementation Plan

See `docs/implementation-plan.md` for the full PR sequence, parallelization diagram, and per-PR scope.

**Summary of parallel tracks (after F.0 + F.1 + F.2 land):**

| Track | PRs |
|---|---|
| A — Onboarding | F.3 → F.6 → F.7 |
| B — Integrations/Settings | F.4 → F.5 ∥ F.8 → F.9 → F.10 |
| C — Dashboard | F.11 → F.12 ∥ F.13 → F.14 |

F.6 is the merge point of Tracks A and B — it requires both F.3 and F.5.

---

## 12. Changelog

### 2026-04-07
- Restructured to next-forge-inspired monorepo: `apps/app/` + `packages/auth/`
- All source code moved to `apps/app/src/`; `@/*` alias now resolves to `apps/app/src/*`
- `packages/auth/` added: thin BetterAuth abstraction (client/server/provider/keys) — only place that imports from `better-auth`
- npm workspaces configured at root; `biome` and `lefthook` are root-only devDeps
- Fixed duplicate §6 in this document
- Updated all file path references throughout

### Earlier — 2026-04-07
- Replaced old scope (minimal search UI) with full product plan
- Auth: BetterAuth chosen over Clerk. Self-hosted via Docker (`auth-db` Postgres service)
- Data fetching: TanStack Query (resolved from TBD)
- Lint/format: Biome (replaces ESLint + Prettier)
- Removed flag audit detail page from scope entirely
- Added explicit out-of-scope list
- Added parallelization plan for multi-person development
- Backend API contracts: integration-management-api.md + analytics-api.md are authoritative
