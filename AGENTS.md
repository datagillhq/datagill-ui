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
| Package manager | npm (existing) | Do not switch to Bun without a dedicated migration PR |
| Type safety | TypeScript strict | `tsc --noEmit` must pass on every PR |
| Env validation | `@t3-oss/env-nextjs` + Zod | All env vars declared in `src/lib/env.ts` |

---

## 2. Auth — BetterAuth (Self-Hosted)

BetterAuth runs **embedded in the Next.js app** as an API route handler at `app/api/auth/[...all]/route.ts`. It is not a separate process. Its data (users, sessions, accounts) lives in a dedicated Postgres instance (`auth-db`) defined in `docker-compose.yml`.

### Docker Services

```yaml
# docker-compose.yml
services:
  app:               # Next.js + BetterAuth embedded — port 3000
  auth-db:           # Postgres 16 for BetterAuth — port 5433
```

`auth-db` is separate from `datagill-core`'s `app-postgres`. Do not mix them.

### Configuration

`src/lib/auth.ts`:
- Adapter: Postgres pointing at `auth-db`
- Plugins: `organization()`, `jwt()`, `invitation()`
- Social providers: Google, GitHub

### JWT Requirement (Critical)

BetterAuth's JWT plugin **must** emit `organizationId` (the user's `activeOrganizationId`) as a claim. DataGill's backend validates this claim on every request — if it's missing, all API calls return 401.

**Verify this before starting F.2.** Document the exact plugin config in `src/lib/auth.ts` once confirmed.

### Ownership Boundary

| Concern | Owner |
|---|---|
| User creation, sessions, sign-in | BetterAuth |
| Org creation (name + slug) | BetterAuth |
| Team invitations, roles | BetterAuth |
| Integration CRUD | DataGill API |
| Org record in DataGill DB | DataGill (created lazily on first `POST /v1/integrations`) |

### Middleware

`src/middleware.ts` guards all routes under `/(app)/*`. Unauthenticated requests redirect to `/sign-in`.

### Route Groups

| Group | Path | Access |
|---|---|---|
| `(auth)` | `/sign-in`, `/sign-up` | Public |
| `(app)` | `/dashboard`, `/onboarding/*`, `/settings/*` | Requires session |

---

## 3. API Conventions

All DataGill API calls go through `src/lib/api.ts`. **Do not call `fetch` directly from pages or components.**

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

## 4. Provider Catalog

The full list of providers (name, logo, description, tags, docsLink) lives statically in `src/lib/providers.ts`. The backend is not the source of truth for the catalog.

`GET /v1/integrations/providers` returns the list of **implemented** provider IDs. The frontend cross-references this to show "Coming Soon" on unimplemented providers. A backend deploy alone can enable a new provider — no frontend change needed.

---

## 5. Mocks Required Before Coding

**Before writing any UI code for a page or component, ask the user for a mock or design reference.**

Mocks are the source of truth for layout, spacing, component variants, interaction states, and copy. Do not invent layout decisions from the implementation plan alone — it describes behavior and data, not visual design.

When starting a PR, ask:

> "Do you have a mock or design file for [page/component]? I need it before writing any layout or styling code."

If the user provides a Figma link, screenshot, or sketch — refer to it throughout the PR and call out any ambiguities before coding rather than guessing. If no mock exists yet, flag this as a blocker and do not proceed with layout code.

Exception: purely structural PRs (F.0, F.1) that have no user-visible UI do not need a mock.

---

## 6. Testing

- Max **100–150 lines** of changed code per PR — split if larger
- All changes via branch + PR — no direct pushes to `main`
- Branch prefix: `feat/`, `fix/`, `chore/`
- `biome check` must pass before opening a PR
- `tsc --noEmit` must pass before opening a PR
- All PRs use the `.github/PULL_REQUEST_TEMPLATE.md`

---

## 6. Testing

### Tools

| Tool | Purpose |
|---|---|
| Vitest | Unit tests — pure functions, data transforms, error code mapping |
| @testing-library/react | Component tests — render, interact, assert on DOM |
| Playwright | E2E tests — full user journeys in a real browser, runs in CI |
| Claude in Chrome | Visual verification during development — agents take screenshots and interact with `localhost` |

### What to Test at Each Layer

**Unit tests (Vitest)** — fast, no DOM needed:
- `src/lib/api.ts` — error code mapping, request construction
- `src/lib/providers.ts` — catalog filtering, Coming Soon logic
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
npm run test          # Vitest unit + component tests
npm run test:e2e      # Playwright E2E (requires dev server running)
npm run test:e2e:ui   # Playwright with UI mode for debugging
```

CI runs `test` and `test:e2e` on every PR.

### Visual Verification with Claude in Chrome

Agents working on UI changes should use Claude in Chrome to visually verify their work before opening a PR:

```bash
# Start dev server in one terminal
npm run dev

# In Claude Code, enable Chrome and ask it to verify
# Example: "Open localhost:3000/onboarding, go through step 2,
# connect a LaunchDarkly integration, and screenshot the result"
```

Claude in Chrome lets an agent click, type, and take screenshots of the running app — use this to catch layout issues, broken states, and interaction bugs that tests won't catch.

### Testing Philosophy

- All meaningful code paths must have a test
- No redundant tests — don't test the same thing twice at different layers
- Component tests cover state machines exhaustively (every modal state, every card variant)
- E2E tests cover user journeys, not implementation details
- Do not mock the DataGill API in E2E tests — use a test environment or MSW for deterministic responses

---

## 7. PR Rules

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

This is especially important when introducing Biome to existing files for the first time.

### Lockfile Rule — Most Common CI Failure

CI uses `npm ci`, which hard-fails if `package-lock.json` is out of sync with `package.json`. **Any time you touch `package.json`:**

```bash
npm install                  # regenerates package-lock.json
git add package-lock.json    # commit it in the same commit
```

Never commit a `package.json` change without the updated lockfile alongside it. The pre-push hook will catch this and block with a clear message before it ever hits CI.

---

## 8. Implementation Plan

See `docs/implementation-plan.md` for the full PR sequence, parallelization diagram, and per-PR scope.

**Summary of parallel tracks (after F.0 + F.1 + F.2 land):**

| Track | PRs |
|---|---|
| A — Onboarding | F.3 → F.6 → F.7 |
| B — Integrations/Settings | F.4 → F.5 ∥ F.8 → F.9 → F.10 |
| C — Dashboard | F.11 → F.12 ∥ F.13 → F.14 |

F.6 is the merge point of Tracks A and B — it requires both F.3 and F.5.

---

## 9. Changelog

### 2026-04-07
- Replaced old scope (minimal search UI) with full product plan
- Auth: BetterAuth chosen over Clerk. Self-hosted via Docker (`auth-db` Postgres service)
- Data fetching: TanStack Query (resolved from TBD)
- Lint/format: Biome (replaces ESLint + Prettier)
- Removed flag audit detail page from scope entirely
- Added explicit out-of-scope list
- Added parallelization plan for multi-person development
- Backend API contracts: integration-management-api.md + analytics-api.md are authoritative
