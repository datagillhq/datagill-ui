# AGENTS.md — DataGill UI: Source of Truth

> This document is the UI repo's **single source of truth** for frontend architecture decisions, product requirements, implementation guardrails, and open questions.
> Every agent and every PR in `datagill-ui` must trace back to this document.
> If a section says **TBD**, that means the decision is not made yet. Do not quietly invent one in code.

---

## 0. North Star

DataGill is a **business intelligence product for engineering organizations**. The frontend should make it easy for a customer to understand:

- what changed
- who changed it
- whether it mattered
- what action they should take next

The UI is not just a reporting layer. It is the product surface where engineering leaders, product teams, and operators decide what to investigate, what to launch, and what to clean up.

For MVP, the UI must make feature flag change history feel:

- trustworthy
- fast
- understandable to non-authors
- safe for org-scoped multi-tenant use

---

## 1. Product Requirements

### MVP — Lights On

| Surface | Goal | Notes |
|---------|------|-------|
| Marketing / landing page | Explain the product clearly and convert curiosity into a demo or sign-up action | Current repo is still in this stage |
| Auth entry points | Sign in, sign up, and org-aware session state | UI can design now even if provider is still TBD |
| Main app shell | Establish navigation, layout, global search entry, theme, account / org switcher | Needs to scale beyond a single page |
| Activity timeline | Answer "what changed recently?" quickly | Should support time, environment, source, actor filters |
| Flag detail view | Give a per-flag narrative and change history | Needs strong empty, loading, and error states |
| Search | Help users find flags and recent changes fast | Structured filters matter as much as full-text |

### P0 — Root Cause Analysis UX

| Surface | Goal |
|---------|------|
| Recent changes view | "What changed in prod in the last X hours?" |
| Timeline filters | Narrow by environment, actor, provider, and time range |
| Change cards | Make automated vs. human changes obvious |
| Rollback visibility | Detect and highlight likely rollback behavior |

### P1 — Developer Velocity UX

| Surface | Goal |
|---------|------|
| Monthly summary | Show launches, deletes, and cleanup trends |
| Stale / dead flags | Help teams identify cleanup opportunities |
| Team / owner views | Show velocity by actor or owner |

### Non-Goals For Right Now

- Fully designing every dashboard before we have product mocks
- Building a complex client state layer before query patterns are clearer
- Implementing auth, billing, or onboarding flows before direction is agreed

---

## 2. Tech Stack

### Decided

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Next.js App Router | Best fit for hybrid SSR + client interactivity |
| Language | TypeScript | Strong contracts across UI, API, and tooling |
| Components | shadcn/ui + local source components | Accessible primitives we own and can modify |
| Styling | Tailwind CSS v4 + semantic tokens | Fast iteration without losing system consistency |
| Theme | Light / dark via `next-themes` | Product needs dark mode support from the start |
| UI port | `3001` locally | Avoids collision with Grafana on `3000` |
| Marketing site structure | Single landing page with anchored scroll sections for now | Faster iteration, clearer product storytelling, easier to evolve into subpages later |

### TBD

| Decision | Options | Blocking On |
|----------|---------|-------------|
| Auth provider | Clerk, Better Auth, other | Product + engineering decision |
| Frontend data fetching strategy | RSC-first, TanStack Query, hybrid | Real app surfaces and mutation patterns |
| Monitoring vendor | Sentry, Datadog RUM, other | Budget, stack preference, privacy posture |
| Product analytics vendor | PostHog, Segment + warehouse, other | Product analytics depth and data ownership needs |
| Feature flag usage in UI | PostHog, LaunchDarkly, none in UI initially | Rollout strategy for frontend experiments |

### Working Recommendation

Until the open questions above are finalized, optimize for:

- server-first rendering where practical
- minimal client state
- explicit component ownership
- low-friction observability hooks
- auth-agnostic UI composition

---

## 3. Frontend Architecture

### App Structure

The frontend should evolve in layers:

- `app/` for routes, layouts, server boundaries, loading states, and route-level composition
- `components/ui/` for reusable primitives
- `components/` for product-specific UI blocks
- `lib/` for utilities, API clients, adapters, event names, and shared frontend logic

### Boundary Rules

- Route files compose; they should not become business-logic dumping grounds.
- API normalization belongs in `lib/`, not in presentational components.
- Reusable product components should accept typed props, not fetch their own data by default.
- UI primitives in `components/ui` must stay generic and not gain product-specific logic.

### Target Route Shape

This is directional, not a commitment to implement everything immediately:

| Route | Purpose |
|------|---------|
| `/` | Marketing / landing page |
| `/sign-in` or modal flow | Authentication entry |
| `/sign-up` or modal flow | Authentication entry |
| `/app` | Default signed-in home |
| `/app/timeline` | Unified recent change feed |
| `/app/flags` | Flag list and search |
| `/app/integrations` | Connected tools, sync health, and setup workflows |
| `/app/flags/[flagKey]` | Flag detail view |
| `/app/settings` | Org, integrations, profile, and billing entry points |

### Pre-Auth Product Shell Direction

- Until real auth is integrated, use a clearly labeled demo signed-in shell instead of fake credentials.
- Keep sample org and user data in a dedicated stub layer so auth wiring can replace it cleanly later.
- Treat `/app` as the post-login destination shape even before route protection exists.
- Flesh out core signed-in routes with mock data before wiring auth so the information architecture is stable first.

### Marketing Site Direction

- Keep the public marketing site as a single long-form landing page for now.
- Use anchored header navigation for sections such as Product, How It Works, Use Cases, About, and Contact.
- Structure sections so they can later become standalone subpages if the content expands.
- Keep sign-in and sign-up accessible from the global header while the product is still pre-launch.
- On mobile, prefer a compact menu trigger over stacking every nav link directly in the header.

### Data Fetching Direction

Current working direction:

- Prefer server-rendered route composition for initial page data.
- Add client-side fetching only where the user clearly benefits from optimistic updates, live filtering, or retained client state.
- Keep search params and filter state URL-addressable whenever possible.
- Introduce a dedicated API client before endpoint usage spreads across the codebase.

### Design System Rules

- Use shadcn primitives before inventing custom wrappers.
- Prefer semantic tokens over raw color values.
- Keep loading, empty, and error states as first-class surfaces, not afterthoughts.
- Build layouts that can scale to dense information without becoming visually noisy.
- Default to accessibility-friendly interactions: keyboard-safe dialogs, visible focus states, correct labels, and proper headings.

### Performance Rules

- Keep client components small and intentional.
- Avoid moving large route trees to `"use client"` unless interactivity requires it.
- Use route-level streaming and suspense where it improves perceived speed.
- Track bundle impact when adding analytics, auth, or replay tooling.

### Security And Multi-Tenancy Rules

- The UI must assume all meaningful data is org-scoped.
- Never cache or reuse data across org boundaries without an explicit org key.
- Auth state, active org, and API headers must be treated as part of the request context.
- Do not leak internal service URLs or trust client-only org assertions.

---

## 4. Customer-Facing Monitoring, Audit, And Analytics

### Important Clarification

This section is about the **tools and data sources our customers connect to DataGill** and the **product surfaces we should build around them**.

It is **not** the place to decide DataGill's own internal telemetry stack.

### Customer / CTO Questions The Frontend Should Help Answer

- What changed in production recently?
- Was the change manual, automated, or part of an incident?
- Which flags are risky, noisy, stale, or likely ready for cleanup?
- Which teams or owners ship quickly and which workflows are stuck?
- Did a flag change correlate with a reliability or business metric shift?
- Which systems should an engineering leader open next to investigate deeper?

### Customer-Facing Tool Categories We Should Design For

| Category | Example Tools | Why Customers Care |
|---------|---------------|--------------------|
| Feature flags | LaunchDarkly, Unleash, Flagsmith | Core MVP source of truth for change history |
| Incident response | PagerDuty | Correlate flag changes with incidents, severity, and response timelines |
| Observability / monitoring | Datadog | Connect flag changes to latency, errors, and service health |
| Data warehouse | Snowflake | Connect launches and flag states to business outcomes |
| Source control | GitHub | Tie flags to PRs, commits, and developer workflows |
| Product analytics | Amplitude, Mixpanel, PostHog | Connect releases and experiments to adoption and behavior |

### Product Recommendation By Phase

| Phase | Customer-Facing Priority | Why |
|------|---------------------------|-----|
| MVP | Feature flag providers only | Keep the first product promise tight and trustworthy |
| Next | PagerDuty + Datadog | Strongest root-cause-analysis value for engineering teams |
| After that | Snowflake + GitHub | Expands into business impact and engineering velocity |
| Later | Product analytics tools | Helps tell the feature adoption and experiment story |

### Frontend Surfaces That Become More Valuable With These Tools

| Surface | Customer Value |
|--------|----------------|
| Unified timeline | One place to see flag changes, incidents, and related signals |
| Flag detail page | Per-flag audit trail, owner context, health indicators, and related events |
| Integration center | Clear setup, health, sync status, permissions, and troubleshooting |
| Monthly summary | Launches, cleanup, incidents, and business impact snapshots |
| Risk / anomaly views | Highlight high-change flags, rollback patterns, and suspicious periods |

### Specific Customer-Facing Recommendations

#### 1. PagerDuty

Useful because customers can connect change history to incident timelines, responders, status transitions, and post-incident learning. This helps DataGill answer not just "what changed?" but "did that change happen during or before an incident?"

#### 2. Datadog

Useful because customers often already treat Datadog as the operational source of truth for service health. Pairing DataGill changes with Datadog-style reliability signals can make the frontend much stronger for root-cause analysis and investigation workflows.

#### 3. Snowflake

Useful because it gives customers a path from engineering activity to business outcomes. This is important if DataGill wants to move from operational visibility into executive reporting and product impact analysis.

#### 4. GitHub

Useful because engineering teams want the story behind a flag: which PR introduced it, who changed it, and what code path likely shipped with it.

#### 5. Product Analytics Tools

Useful as a later-stage integration category when customers want to compare launches and experiments against user behavior or conversion. This is valuable, but likely less urgent than incident and monitoring integrations for the first product releases.

### Frontend Design Rules For These Integrations

- Show the source system clearly on every relevant event or metric.
- Preserve confidence by distinguishing native data from inferred correlations.
- Always show sync freshness and last-updated timestamps.
- Make it easy to pivot from DataGill insight to the connected source system.
- Treat audit history, permissions, and integration health as first-class UX, not admin afterthoughts.

### Internal Telemetry Status

DataGill's own internal monitoring / analytics tooling is still **TBD** and is intentionally outside the scope of this section.

---

## 5. Auth Direction

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
|--------|-----------|-------|
| Clerk | Fastest path to production-grade auth, polished UI flows, strong org story | Vendor dependency, hosted-service pricing / control tradeoffs |
| Better Auth | Greater ownership, flexibility, and TypeScript-native customization | More implementation responsibility, more frontend and backend integration work |

### Working Recommendation

If the goal is to move quickly to a production-quality MVP with orgs and low auth implementation risk, **Clerk is the safer near-term default**.

If long-term control, self-hosting flexibility, or deep auth customization is a top-level product constraint, **Better Auth deserves serious consideration**, but it will likely cost more engineering time up front.

### Until Auth Is Chosen

- Keep auth UI provider-agnostic.
- Avoid hard-coding provider concepts into route structure.
- Separate "auth screens" from "auth SDK wiring".
- Treat org context as a first-class concept in both UI copy and architecture.

---

## 6. Working With AI Agents

### What Good Subtasks Look Like

Good frontend subtasks are narrow, testable, and own a disjoint write surface.

Examples:

- Build the authenticated app shell and navigation
- Add analytics instrumentation for the auth funnel
- Create empty / loading / error states for timeline and flag detail pages
- Implement the integrations setup page UI only
- Add Sentry wiring and release tags without changing product flows

### What Bad Subtasks Look Like

- "Refactor the frontend"
- "Improve the UX everywhere"
- "Set up analytics" without event definitions or acceptance criteria
- Multiple agents editing the same design system files at once

### Subtask Template

Each meaningful subtask should define:

- goal
- owned files or directories
- acceptance criteria
- known dependencies
- open questions that block implementation

### Coordination Rules

- Shared primitives should be edited by one agent at a time where possible.
- Product copy and architecture docs should be updated in the same change when decisions move.
- If a subtask changes route shape, auth assumptions, or event names, update this file.

---

## 7. Open Questions

- Should the first signed-in experience be a dashboard, a timeline, or an onboarding checklist?
- Which auth provider do we choose for MVP: Clerk or Better Auth?
- Do we want org switching in MVP or only single-org membership initially?
- When do we adopt a dedicated client query layer?
- Which analytics taxonomy should become canonical across product, growth, and engineering?
- How much session replay is acceptable from a privacy and performance standpoint?

---

## 8. Documentation Rule

When frontend architecture, auth direction, analytics strategy, or product flows change, update this file in the same change.
