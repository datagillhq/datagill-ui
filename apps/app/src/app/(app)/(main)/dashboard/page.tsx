"use client";

import {
  type AuditLogEntry,
  type LaunchedFlag,
  type TeamActivity,
  makeDateRange,
  useAuditLog,
  useLaunchedWins,
  useTopTeams,
  useVelocity,
} from "@/hooks/use-analytics";
import { Activity, ChevronDown, ChevronLeft, ChevronRight, Flag, Users, Zap } from "lucide-react";
import { useState } from "react";

const DATE_PRESETS = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}

function formatVelocity(ms?: number) {
  if (!ms) return null;
  if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)}m`;
  if (ms < 86_400_000) {
    const h = Math.floor(ms / 3_600_000);
    const m = Math.round((ms % 3_600_000) / 60_000);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${Math.round(ms / 86_400_000)} days`;
}

function ActorAvatar({ name }: { name?: string }) {
  const label = name?.slice(0, 2).toUpperCase() ?? "?";
  return (
    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600/20 text-[10px] font-semibold text-indigo-400">
      {label}
    </span>
  );
}

function RolloutBadge({ pct }: { pct?: number }) {
  const is100 = pct === 100;
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
        is100 ? "bg-indigo-600 text-white" : "border border-border text-muted-foreground"
      }`}
    >
      {pct != null ? `${pct}% Rollout` : "—"}
    </span>
  );
}

function EventTypeBadge({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center rounded border border-border px-2 py-0.5 text-[10px] font-medium capitalize text-muted-foreground">
      {type}
    </span>
  );
}

// ─── Sections ────────────────────────────────────────────────────────────────

function LaunchedWinsSection({ flags }: { flags?: LaunchedFlag[] }) {
  return (
    <section className="mb-6">
      <div className="mb-3 flex items-center gap-2">
        <Flag className="h-4 w-4 text-indigo-400" />
        <h2 className="text-base font-semibold text-foreground">Launched Wins</h2>
      </div>
      <div className="rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="px-4 py-3 text-left font-medium">Feature Flag</th>
              <th className="px-4 py-3 text-left font-medium">Actor</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {flags && flags.length > 0 ? (
              flags.map((f) => (
                <tr
                  key={f.flagKey}
                  className="border-b border-border last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-medium text-foreground">{f.flagName}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <ActorAvatar name={f.actorName} />
                      {f.actorName || f.actorEmail}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <RolloutBadge pct={f.rolloutPercentage} />
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {formatDate(f.occurredAt)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No flags reached 100% rollout in this period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TopTeamsSection({ teams }: { teams?: TeamActivity[] }) {
  return (
    <div className="flex flex-col">
      <div className="mb-3 flex items-center gap-2">
        <Users className="h-4 w-4 text-indigo-400" />
        <h2 className="text-base font-semibold text-foreground">Top Teams</h2>
      </div>
      <div className="flex-1 rounded-xl border border-border bg-card p-4">
        {teams && teams.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {teams.slice(0, 4).map((team) => (
              <div
                key={team.teamName}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/10">
                    <Users className="h-4 w-4 text-indigo-400" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">{team.teamName}</p>
                </div>
                <span className="text-lg font-bold text-indigo-400">{team.changeCount}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No team activity in this period.</p>
        )}
      </div>
    </div>
  );
}

function VelocityCard({ ms, sampleSize }: { ms?: number; sampleSize?: number }) {
  const formatted = formatVelocity(ms);
  return (
    <div className="flex flex-col">
      <div className="mb-3 flex items-center gap-2">
        <Zap className="h-4 w-4 text-indigo-400" />
        <h2 className="text-base font-semibold text-foreground">Velocity</h2>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-border bg-card p-6 text-center">
        {formatted ? (
          <>
            <p className="text-4xl font-bold text-foreground">{formatted}</p>
            <p className="mt-2 text-xs text-muted-foreground">avg. time to 100% rollout</p>
            {sampleSize != null && sampleSize < 3 && (
              <p className="mt-2 text-xs text-muted-foreground">
                Based on {sampleSize} flag{sampleSize !== 1 ? "s" : ""} — low sample size
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Not enough data yet.</p>
        )}
      </div>
    </div>
  );
}

function AuditLogSection({
  entries,
  total,
  page,
  onPageChange,
}: {
  entries?: AuditLogEntry[];
  total: number;
  page: number;
  onPageChange: (p: number) => void;
}) {
  const limit = 25;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-indigo-400" />
          <h2 className="text-base font-semibold text-foreground">Activity Log</h2>
        </div>
        {total > 0 && (
          <span className="text-xs text-muted-foreground">
            {from}–{to} of {total}
          </span>
        )}
      </div>
      <div className="rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="px-4 py-3 text-left font-medium">Time</th>
              <th className="px-4 py-3 text-left font-medium">Flag</th>
              <th className="px-4 py-3 text-left font-medium">Actor</th>
              <th className="px-4 py-3 text-left font-medium">Event</th>
              <th className="px-4 py-3 text-left font-medium">Environments</th>
            </tr>
          </thead>
          <tbody>
            {entries && entries.length > 0 ? (
              entries.map((e) => (
                <tr
                  key={`${e.flagKey}-${e.occurredAt}`}
                  className="border-b border-border last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {formatTime(e.occurredAt)}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{e.flagName}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <ActorAvatar name={e.actorName} />
                      {e.actorName || e.actorEmail}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <EventTypeBadge type={e.eventType} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {e.environments.map((env) => (
                        <span
                          key={env}
                          className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground"
                        >
                          {env}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No activity recorded in this period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {total > limit && (
          <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </button>
            <span className="text-xs text-muted-foreground">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [days, setDays] = useState<7 | 30 | 90>(7);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [auditPage, setAuditPage] = useState(1);
  const range = makeDateRange(days);

  const { data: flags, isLoading: loadingFlags } = useLaunchedWins(range);
  const { data: teams, isLoading: loadingTeams } = useTopTeams(range);
  const { data: velocity, isLoading: loadingVelocity } = useVelocity(range);
  const { data: auditLog, isLoading: loadingAudit } = useAuditLog(range, auditPage);

  const selectedLabel = DATE_PRESETS.find((p) => p.days === days)?.label ?? "Last 7 days";

  function handleDaysChange(d: 7 | 30 | 90) {
    setDays(d);
    setAuditPage(1); // reset pagination on date change
    setDropdownOpen(false);
  }

  return (
    <div className="px-10 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cross-functional visibility and deployment velocity.
          </p>
        </div>
        {/* Date range picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen((o) => !o)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            {selectedLabel}
            <ChevronDown className="h-3 w-3" />
          </button>
          {dropdownOpen && (
            <>
              {/* Backdrop */}
              <button
                type="button"
                className="fixed inset-0 z-10 cursor-default"
                aria-label="Close dropdown"
                tabIndex={-1}
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-lg border border-border bg-card py-1 shadow-lg">
                {DATE_PRESETS.map((preset) => (
                  <button
                    key={preset.days}
                    type="button"
                    onClick={() => handleDaysChange(preset.days)}
                    className={`flex w-full items-center justify-between px-3 py-2 text-xs hover:bg-muted ${
                      days === preset.days ? "text-indigo-400" : "text-foreground"
                    }`}
                  >
                    {preset.label}
                    {days === preset.days && (
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Launched Wins */}
      {loadingFlags ? (
        <div className="mb-6 h-40 animate-pulse rounded-xl bg-card" />
      ) : (
        <LaunchedWinsSection flags={flags ?? []} />
      )}

      {/* Bottom row: Top Teams + Velocity */}
      <div className="grid grid-cols-[1fr_200px] gap-5">
        {loadingTeams ? (
          <div className="h-40 animate-pulse rounded-xl bg-card" />
        ) : (
          <TopTeamsSection teams={teams ?? []} />
        )}
        {loadingVelocity ? (
          <div className="h-40 animate-pulse rounded-xl bg-card" />
        ) : (
          <VelocityCard ms={velocity?.averageMs} sampleSize={velocity?.sampleSize} />
        )}
      </div>

      {/* Audit Log */}
      {loadingAudit ? (
        <div className="mt-6 h-64 animate-pulse rounded-xl bg-card" />
      ) : (
        <AuditLogSection
          entries={auditLog?.data}
          total={auditLog?.total ?? 0}
          page={auditPage}
          onPageChange={setAuditPage}
        />
      )}
    </div>
  );
}
