# AGENTS.md — DataGill UI Working Agreement

> This file is the authoritative working guide for agents and contributors in this repo.
> It should stay aligned with `datagill-core/AGENTS.md` for cross-repo decisions.
> Do not implement something that contradicts this document without updating it first.
> **TBD** means the decision has not been made — do not invent one.

---

## 0. Product Context

DataGill is a **business intelligence platform for engineering teams**. It connects to the tools engineers use to ship software, normalizes the data into a unified model, and surfaces it through a web UI so teams can answer hard questions about their work.

| Data Source | Questions Unlocked |
|---|---|
| Feature flags (LaunchDarkly, Unleash, Flagsmith) | What changed before the incident? How long to ship a flag? |
| Code (GitHub) | Which PR shipped this flag? Time from commit → flag on in prod? |
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
| Time from flag creation → on in prod | All 3 | Requires `first_seen_at` per flag |
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
| Natural language search | LLM over stored embeddings — do not rely on source `q` param alone |
| Risk score | Blast radius × recent change rate |
| AI narrative summaries per flag | LLM over flag event history |

---

## 2. Scope For This Repo

- Focus only on `datagill-ui` and the Search Service API in `datagill-core`
- Do not introduce Temporal into the search flow
- Keep the frontend minimal until product flows are clearer — do not over-engineer
- All data comes from the Search Service (`GET /search`, `GET /flags`, `GET /flags/:flag_key`, etc.)

---

## 3. Current UI Decisions

| Area | Decision |
|---|---|
| Framework | Next.js App Router |
| Components | shadcn/ui primitives |
| Styling | Tailwind CSS + `cn()` |
| Data flow | Server Components fetch from Search Service |
| Search backend target | `http://localhost:8082` by default |

---

## 4. Frontend Engineering Standards

### Project Structure

```
src/
├── app/                    # App Router pages & layouts
│   ├── (auth)/             # Route groups (no URL segment)
│   ├── (dashboard)/
│   └── api/                # Route handlers
├── components/
│   ├── ui/                 # shadcn primitives (auto-generated, do not hand-edit)
│   └── [feature]/          # Feature-scoped components (e.g. dashboard/, flags/)
├── hooks/                  # Custom React hooks (use- prefix)
├── lib/                    # Utilities, clients, constants
│   ├── utils.ts            # cn() and shared helpers
│   └── [service].ts        # e.g. search.ts, auth.ts
├── types/                  # Global TypeScript types & interfaces
└── styles/                 # Global CSS, Tailwind config overrides
```

### shadcn/ui Components

- **Never hand-edit files inside `components/ui/`** — re-run `npx shadcn@latest add <component>` to update or add.
- Compose shadcn primitives; don't rebuild what already exists (e.g. use `<Dialog>`, not a custom modal).
- Extend with `className` via `cn()`, never with inline styles.

```tsx
// ✅ Correct
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

<Button className={cn("w-full", isLoading && "opacity-50")} />

// ❌ Wrong
<button style={{ width: "100%", opacity: isLoading ? 0.5 : 1 }} />
```

### Component Authoring

- **One component per file.** File name = component name in kebab-case (`flag-card.tsx`).
- Export components as **named exports**, not default (improves tree-shaking & refactoring).
- Keep components **under 150 lines**. Extract sub-components or hooks when larger.
- Use `interface` over `type` for component props; suffix with `Props`.

```tsx
// ✅
interface FlagCardProps {
  flag: Flag;
  onSelect?: (key: string) => void;
}

export function FlagCard({ flag, onSelect }: FlagCardProps) { ... }
```

### Styling

- **Tailwind-first.** Class names only; no CSS modules or styled-components.
- Use `cn()` from `@/lib/utils` for conditional classes — it merges Tailwind properly via `clsx` + `tailwind-merge`.
- Design tokens live in `tailwind.config.ts` and CSS variables in `globals.css`. Never hardcode hex values in JSX.
- Responsive classes use mobile-first order: `base → sm → md → lg → xl`.
- Dark mode via class strategy. Use semantic tokens (`bg-background`, `text-foreground`, `border`) — not `bg-white dark:bg-black`.

```tsx
// ✅ Token-driven, responsive
<div className="px-4 md:px-8 text-foreground bg-background" />

// ❌ Hardcoded, not responsive
<div className="px-6 text-[#333] bg-[#fff]" />
```

### Next.js App Router

**Server vs. Client Components**

- Default to Server Components. Only add `"use client"` when you need: `useState`, `useEffect`, event handlers, browser APIs, or context.
- Push `"use client"` as far down the tree as possible — wrap only the interactive leaf, not the whole page.

```tsx
// ✅ Server Component fetches data
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const data = await fetchDashboardData();
  return <DashboardView data={data} />;
}
```

**Data Fetching**

- Fetch in Server Components using `async/await` directly — no `useEffect` data fetching.
- Use `React.cache()` for deduplication across the same request.
- Use `loading.tsx` and `error.tsx` colocated with pages for streaming UI.
- Prefer server actions (`"use server"`) for mutations over separate API routes when possible.

```tsx
// ✅ Server Action for mutations
"use server";
export async function updateUser(formData: FormData) {
  await db.user.update({ ... });
  revalidatePath("/dashboard");
}
```

**Routing**

- Use route groups `(folder)` to share layouts without affecting the URL.
- Use parallel routes `@slot` for complex dashboard layouts.
- Colocate page-specific components inside the `app/` segment folder.

### TypeScript

- **Strict mode on.** No `any` — use `unknown` and narrow, or define types.
- Generate types from your data source (API schema, Zod inference) — don't write them by hand when avoidable.
- Use Zod for **runtime validation** of all external data (API responses, form input, env vars).

```ts
// ✅ Validated at runtime
import { z } from "zod";

const FlagSchema = z.object({ key: z.string(), name: z.string() });
type Flag = z.infer<typeof FlagSchema>;
```

### Forms

- Use **react-hook-form** + **Zod** + shadcn's `<Form>` components — this is the blessed stack.
- Never manage form state manually with `useState`.

```tsx
const form = useForm<z.infer<typeof schema>>({
  resolver: zodResolver(schema),
  defaultValues: { email: "" },
});
```

### State Management

| Scope | Tool |
|---|---|
| Server state / caching | React Query or SWR |
| URL state | `nuqs` or `useSearchParams` |
| Global UI state (modals, toasts) | Zustand or React Context |
| Form state | react-hook-form |

- Avoid `useEffect` for derived state — compute it inline or use `useMemo`.
- Prefer URL state over component state for anything shareable/bookmarkable.

### Performance

- Use **`next/image`** for every `<img>`. Always supply `width`, `height` or `fill` + `sizes`.
- Use **`next/font`** for all fonts — never load fonts from a `<link>` tag.
- Dynamic import heavy components and third-party libs that aren't needed on first paint.

```tsx
const HeavyChart = dynamic(() => import("@/components/heavy-chart"), { ssr: false });
```

- Wrap expensive client computations in `useMemo`/`useCallback` only when profiling shows it helps.

### Accessibility

- All interactive elements must be keyboard navigable — shadcn primitives handle this if used correctly.
- Every `<img>` needs descriptive `alt`. Decorative images use `alt=""`.
- Use semantic HTML (`<nav>`, `<main>`, `<section>`, `<article>`) — don't `<div>` everything.

### Error Handling

- All `async` server functions must be wrapped in `try/catch`.
- Surface errors to users via shadcn `<Toast>` or inline form errors — never `console.error` only.
- Use `notFound()` and `redirect()` from `next/navigation` in server code.

### File & Import Conventions

- Path aliases: always use `@/` (mapped to `src/`). No relative `../../` imports beyond one level.
- Import order: React → Next → third-party → internal `@/` → types → styles.
- Env vars: server-only vars in `process.env.SECRET`, public vars as `NEXT_PUBLIC_` prefix. Validate all env vars with Zod at startup (`lib/env.ts`).

### Testing

- **Unit tests** (Vitest): pure functions, hooks, Zod schemas.
- **Component tests** (React Testing Library): test behaviour, not implementation.
- **E2E tests** (Playwright): critical user paths (auth, core flows).
- Don't test shadcn internals — test your composition and logic.

---

## 5. What Agents Must Always Do

- Run `npx shadcn@latest add <component>` to add new primitives — never scaffold them manually.
- Check if a shadcn component exists before building a custom one.
- Validate all props with TypeScript — no implicit `any`.
- Prefer Server Components and server actions. Reach for `"use client"` last.
- Keep `components/ui/` untouched — customise via `className` and `cn()`.
- Use `revalidatePath` / `revalidateTag` after mutations, not full page refreshes.
- Every query to the Search Service must be scoped by `org_id` — no cross-tenant requests.
- Read this file before starting any task. If a decision here conflicts with what you're about to build, update this file first.

---

## 6. Near-Term Next Steps

- Wire Clerk auth and pass `org_id` on all Search Service requests
- Add a dedicated API client layer (`lib/search.ts`) when more endpoints land
- Replace any hand-rolled primitives with generated shadcn components
- Revisit frontend data fetching strategy (TanStack Query vs. SWR vs. RSC-only) after the LLD decision

---

## 7. Documentation Rule

When a UI design or architecture decision changes, update this file in the same PR.
