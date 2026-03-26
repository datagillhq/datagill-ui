# AGENTS.md — DataGill UI: Source of Truth

> This document is the authoritative working guide for agents and contributors in `datagill-ui`.
> It should stay aligned with `datagill-core/AGENTS.md` for cross-repo decisions.
> Do not implement something that contradicts this document without updating it first.
> **TBD** means the decision has not been made yet. Do not quietly invent one in code.

---

## 0. Product Context

DataGill is a **business intelligence platform for engineering teams**. It connects to the tools engineers use to ship software, normalizes the data into a unified model, and surfaces it through a web UI so teams can answer hard questions about their work.

| Data Source | Questions Unlocked |
|---|---|
| Feature flags (LaunchDarkly, Unleash, Flagsmith) | What changed before the incident? How long to ship a flag? |
| Code (GitHub) | Which PR shipped this flag? Time from commit -> flag on in prod? |
| Incidents (PagerDuty) | Was there an incident open when this flag was rolled back? |
| Business metrics (Datadog) | Did this flag change correlate with a latency spike? |
| Data warehouse (Snowflake) | What did conversion rate look like when this feature launched? |

**MVP = feature flag providers only.** Architecture must accommodate future data source categories without rearchitecting the UI.

---

## 1. Product Requirements

> "All 3" = LaunchDarkly, Unleash, Flagsmith. "LD" = LaunchDarkly only.

### MVP — Lights On

| Feature | Source | Notes |
|---|---|---|
| Activity feed (who changed what, when) | All 3 | LD `titleVerb` is cleanest canonical description |
| Flag status (off / on / partial) | All 3 | LD direct; Unleash/Flagsmith need inference |
| Trend line (changes over time) | All 3 | Aggregate by day |
| Actor attribution (last modified by) | All 3 | Normalize to `actor_email` |
| Search by flag name / time range | All 3 | LD supports full-text; others: time range only |
| Flag detail page | All 3 | Current state + paginated event history per flag |

### P0 — Root Cause Analysis

| Feature | Source | Notes |
|---|---|---|
| "What changed in the last X hours?" scoped to prod | All 3 | Filter by environment + time window |
| Automated vs. human change detection | LD | `token.serviceToken` field distinguishes API vs. human |
| Rollback detection | All 3 | Flag toggled back within short window |
| Per-flag timeline view | All 3 | Paginated history per flag, newest first |

### P1 — Developer Velocity

| Feature | Source | Notes |
|---|---|---|
| Time from flag creation -> on in prod | All 3 | Requires `first_seen_at` per flag |
| Stale flag list (created, never launched) | All 3 | No "enabled" event past X days |
| Dead flag list (launched 60+ days, no changes) | All 3 | Compare `last_event_at` |
| Flag cleanup suggestions | Derived | Combine stale + dead signals |
| Owner-level velocity | All 3 | Group by actor across flag history |

### P1 — Monthly Snapshot

| Feature | Source | Notes |
|---|---|---|
| Flags launched this month | All 3 | Count enable/100% events |
| Flags cleaned up (deleted) | All 3 | Count delete events |
| Monthly digest | Derived | AI-generated narrative is a P2 enhancement |

### P2 — Intelligence

| Feature | Notes |
|---|---|
| Anomaly: high change frequency | Flag changed >N times in 24h |
| Natural language search | LLM over stored embeddings; do not rely on source `q` param alone |
| Risk score | Blast radius x recent change rate |
| AI narrative summaries per flag | LLM over flag event history |

---

## 2. Scope For This Repo

- Focus only on `datagill-ui` and the Search Service API in `datagill-core`
- Do not introduce Temporal into the search flow
- Keep the frontend minimal until product flows are clearer; do not over-engineer
- All production data should come from the Search Service layer once integration begins

---

## 3. Current UI Decisions

| Area | Decision |
|---|---|
| Framework | Next.js App Router |
| Components | shadcn/ui primitives plus intentionally customized local source files |
| Styling | Tailwind CSS v4 + `cn()` + semantic tokens in `globals.css` |
| Theme | Light / dark via `next-themes` |
| Data flow | Server-first rendering; add client code only where interactivity requires it |
| Search backend target | `http://localhost:8082` by default |
| Marketing site | Single anchored landing page for now |
| Signed-in shell before auth | Demo session stub, not fake credentials |

### Current Route Shape

| Route | Purpose |
|---|---|
| `/` | Marketing / landing page |
| `/sign-in` or modal flow | Authentication entry |
| `/sign-up` or modal flow | Authentication entry |
| `/app` | Default signed-in home |
| `/app/timeline` | Unified recent change feed |
| `/app/flags` | Flag list and search |
| `/app/integrations` | Connected tools, sync health, and setup workflows |
| `/app/flags/[flagKey]` | Flag detail view |
| `/app/settings` | Org, integrations, profile, and billing entry points |

### Active Open Decisions

| Decision | Options | Blocking On |
|---|---|---|
| Auth provider | Better Auth, Clerk, other | Product + engineering decision |
| Frontend data fetching strategy | RSC-first, TanStack Query, hybrid | Real endpoint usage and mutation patterns |
| Internal telemetry stack | TBD | Budget and deployment preference |
| Product analytics vendor | TBD | Product analytics needs and privacy posture |
| Feature flag usage in UI | LaunchDarkly, PostHog, none initially | Rollout strategy for frontend experiments |

---

## 4. Frontend Architecture

### Directory Structure

This repo currently uses a root-level App Router structure. Do not assume a `src/` directory exists.

```text
app/           # App Router pages, layouts, route segments
components/    # Product-specific components
components/ui/ # shadcn-based primitives and local customizations
lib/           # Utilities, stubs, clients, helpers
public/        # Static assets
```

### Boundary Rules

- Route files compose pages and layouts; they should not become business-logic dumping grounds.
- API normalization belongs in `lib/`, not in presentational components.
- Reusable product components should accept typed props and stay mostly data-agnostic.
- `components/ui/` is for reusable primitives, not product-specific logic.

### Marketing Site Direction

- Keep the public site as a single long-form landing page for now.
- Use anchored header navigation for sections such as Product, How It Works, Use Cases, About, and Contact.
- Structure sections so they can later become standalone subpages if the content expands.
- Keep sign-in and sign-up accessible from the global header while the product is still pre-launch.
- On mobile, prefer a compact menu trigger over stacking every nav link directly in the header.

### Pre-Auth Product Shell Direction

- Until real auth is integrated, use a clearly labeled demo signed-in shell instead of fake credentials.
- Keep sample org and user data in a dedicated stub layer so auth wiring can replace it cleanly later.
- Treat `/app` as the post-login destination shape even before route protection exists.
- Flesh out core signed-in routes with mock data before wiring auth so the information architecture stabilizes first.

### Data Fetching Direction

- Prefer Server Components for initial page data.
- Add client-side fetching only where the user clearly benefits from live filtering, optimistic updates, or retained client state.
- Keep search params and filters URL-addressable whenever possible.
- Introduce a dedicated API client before endpoint usage spreads across the codebase.
- When real backend integration starts, validate external data with schemas instead of trusting raw JSON shapes.

---

## 5. Frontend Engineering Standards

### shadcn/ui Components

- Check whether a shadcn primitive already exists before building a custom component.
- Prefer composing shadcn primitives over rebuilding common UI from scratch.
- Do not casually hand-edit `components/ui/` files.
- If a primitive is intentionally customized locally, treat it as part of this repo's design system and preserve that customization carefully.
- Extend via `className` and `cn()` instead of inline styles.

```tsx
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

<Button className={cn("w-full", isLoading && "opacity-50")} />
```

### Component Authoring

- Prefer one exported component per file when practical.
- Use named exports, not default exports, for reusable components.
- Prefer `interface` for component props and suffix with `Props`.
- Components do not need to obey a hard line-count rule, but if readability drops, extract sub-components or helpers.

```tsx
interface FlagCardProps {
  flag: Flag;
  onSelect?: (key: string) => void;
}

export function FlagCard({ flag, onSelect }: FlagCardProps) {
  return null;
}
```

### Styling

- Tailwind-first. Do not introduce CSS modules or styled-components.
- Use `cn()` from `@/lib/utils` for conditional classes.
- Keep design tokens in `app/globals.css` and use semantic classes such as `bg-background`, `text-foreground`, and `border`.
- Avoid hardcoded hex colors in JSX.
- Use mobile-first responsive classes.
- Dark mode should rely on semantic tokens, not one-off `dark:` overrides everywhere.

### Next.js App Router

- Default to Server Components.
- Add `"use client"` only when needed for state, effects, browser APIs, context, or event handlers.
- Push `"use client"` as far down the tree as possible.
- Prefer colocated route segments, layouts, and page-level composition over giant shared pages.
- When mutations eventually exist, evaluate server actions before adding extra API routes.

### TypeScript

- Keep strict typing; do not introduce implicit `any`.
- Use `unknown` and narrow when needed.
- When integrating external APIs or forms, prefer runtime validation with Zod or equivalent schema validation.
- Mock/demo data in `lib/` is acceptable during design exploration, but production integration should move toward typed API clients and validated responses.

### State Management

- Keep state local until a real shared-state need appears.
- Prefer URL state for shareable filters and search.
- Do not adopt React Query, SWR, Zustand, or other state libraries by default before the data model requires them.
- Avoid `useEffect` for derived state when values can be computed directly.

### Performance

- Keep client components small and intentional.
- Avoid moving large route trees to `"use client"`.
- Use streaming and route-level loading states when it improves UX.
- Watch bundle impact when adding auth, analytics, charts, or replay tooling.

### Accessibility

- Use semantic HTML such as `nav`, `main`, `section`, and `article`.
- All interactive elements must remain keyboard navigable.
- Every non-decorative image needs meaningful `alt` text.
- Prefer shadcn primitives for accessible dialogs, buttons, and focus behavior.

### Error Handling

- Do not rely on `console.error` alone for user-visible failures.
- Use explicit empty, loading, and error states in product surfaces.
- Use `notFound()` and `redirect()` where appropriate in server-side route code.
- Catch and surface errors where the failure mode matters to the user or the flow.

### File and Import Conventions

- Use the `@/` alias for internal imports.
- Avoid deep relative imports when an alias is available.
- Keep imports reasonably grouped: framework, third-party, internal.
- Validate env vars before depending on them in production code.

### Testing

- Unit tests should cover pure helpers, schema parsing, and isolated logic.
- Component tests should focus on behavior and composition, not shadcn internals.
- E2E tests should eventually cover auth, timeline, and flag workflows.
- Do not block current UI exploration on full test coverage before the flows settle.

---

## 6. Customer-Facing Monitoring, Audit, And Analytics

### Important Clarification

This section is about the **tools and data sources our customers connect to DataGill** and the **product surfaces we should build around them**.

It is **not** the place to decide DataGill's own internal telemetry stack.

### Customer / CTO Questions The Frontend Should Help Answer

- What changed in production recently?
- Was the change manual, automated, or part of an incident?
- Which flags are risky, noisy, stale, or ready for cleanup?
- Which teams or owners ship quickly and which workflows are stuck?
- Did a flag change correlate with a reliability or business metric shift?
- Which systems should an engineering leader open next to investigate deeper?

### Customer-Facing Tool Categories We Should Design For

| Category | Example Tools | Why Customers Care |
|---|---|---|
| Feature flags | LaunchDarkly, Unleash, Flagsmith | Core MVP source of truth for change history |
| Incident response | PagerDuty | Correlate flag changes with incidents, severity, and response timelines |
| Observability / monitoring | Datadog | Connect flag changes to latency, errors, and service health |
| Data warehouse | Snowflake | Connect launches and flag states to business outcomes |
| Source control | GitHub | Tie flags to PRs, commits, and developer workflows |
| Product analytics | Amplitude, Mixpanel, PostHog | Connect releases and experiments to adoption and behavior |

### Product Recommendation By Phase

| Phase | Customer-Facing Priority | Why |
|---|---|---|
| MVP | Feature flag providers only | Keep the first product promise tight and trustworthy |
| Next | PagerDuty + Datadog | Strongest root-cause-analysis value for engineering teams |
| After that | Snowflake + GitHub | Expands into business impact and engineering velocity |
| Later | Product analytics tools | Helps tell the feature adoption and experiment story |

### Frontend Design Rules For These Integrations

- Show the source system clearly on every relevant event or metric.
- Distinguish native data from inferred or correlated insight.
- Always show sync freshness and last-updated timestamps.
- Make it easy to pivot from DataGill insight to the connected source system.
- Treat audit history, permissions, and integration health as first-class UX.

---

## 7. Auth Direction

### Requirements

The auth layer must support:

- email / password and social sign-in
- secure session management
- org or workspace membership
- role-aware UI
- a path to invitations and multi-user collaboration
- future B2B features such as SSO without forcing a re-architecture

### Provider Options Under Consideration

| Option | Strengths | Risks |
|---|---|---|
| Clerk | Fastest path to production-grade auth, polished UI flows, strong org story | Vendor dependency, hosted-service pricing and control tradeoffs |
| Better Auth | Greater ownership, flexibility, and TypeScript-native customization | More implementation responsibility, more frontend and backend integration work |

### Working Direction

Better Auth is the leading direction at the moment, but the decision is **not final** until the integration model, org story, and implementation cost are reviewed.

### Until Auth Is Chosen

- Keep auth UI provider-agnostic.
- Avoid hard-coding provider concepts into route structure.
- Separate auth screens from auth SDK wiring.
- Treat org context as a first-class concept in both UI copy and architecture.

---

## 8. Working With AI Agents

### What Agents Must Always Do

- Read this file before starting meaningful work.
- Update this file in the same change when a design or architecture decision moves.
- Check for an existing shadcn primitive before building a custom one.
- Prefer Server Components and server-first composition.
- Avoid inventing unstated product or architecture decisions when a section is marked TBD.
- Keep `org_id` and multi-tenant boundaries in mind for all real data requests.

### Good Subtasks

Good frontend subtasks are narrow, testable, and own a clear write surface.

Examples:

- Build the authenticated app shell and navigation
- Create empty, loading, and error states for timeline and flag detail pages
- Implement the integrations setup page UI only
- Add a dedicated Search Service client once multiple endpoints are wired

### Bad Subtasks

- "Refactor the frontend"
- "Improve the UX everywhere"
- "Set up analytics" without event definitions or acceptance criteria
- Multiple agents editing the same shared primitive files at once

### Subtask Template

Each meaningful subtask should define:

- goal
- owned files or directories
- acceptance criteria
- known dependencies
- open questions that block implementation

---

## 9. Near-Term Next Steps

- Decide the auth provider and org model before wiring protected routes
- Add a dedicated Search Service client in `lib/` when endpoint usage grows
- Build the first real flag detail route at `/app/flags/[flagKey]`
- Revisit whether the signed-in home should center on overview, timeline, or onboarding
- Add schema validation when real backend data replaces mock data

---

## 10. Documentation Rule

When a UI design, architecture decision, auth direction, or route structure changes, update this file in the same PR.
