"use client";

import {
  type LaunchedFlag,
  type TeamActivity,
  useLaunchedWins,
  useTopTeams,
  useVelocity,
} from "@/hooks/use-analytics";
import { ExternalLink, Flag, Users, Zap } from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
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

// ─── Sub-components ─────────────────────────────────────────────────────────

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

function ActorAvatar({ name, initials }: { name?: string; initials?: string }) {
  const label = initials ?? name?.slice(0, 2).toUpperCase() ?? "?";
  return (
    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600/20 text-[10px] font-semibold text-indigo-400">
      {label}
    </span>
  );
}

function LaunchedWinsSection({ flags }: { flags?: LaunchedFlag[] }) {
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Flag className="h-4 w-4 text-indigo-400" />
          Launched Wins
        </h2>
      </div>
      <div className="rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="px-4 py-3 text-left font-medium">Feature Flag Name</th>
              <th className="px-4 py-3 text-left font-medium">Actor</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {flags && flags.length > 0 ? (
              flags.map((f) => (
                <tr key={f.name} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2 font-medium text-indigo-400">
                      {f.sourceUrl ? (
                        <a
                          href={f.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:underline"
                        >
                          {f.name}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        f.name
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <ActorAvatar name={f.actorName} initials={f.actorInitials} />
                      {f.actorName ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <RolloutBadge pct={f.rolloutPercentage} />
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {formatDate(f.date)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-muted-foreground">
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
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Users className="h-4 w-4 text-indigo-400" />
          Top Teams
        </h2>
        <span className="rounded border border-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Activity Heatmap
        </span>
      </div>
      {teams && teams.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {teams.slice(0, 4).map((team) => (
            <div
              key={team.name}
              className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/10">
                  <Users className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{team.name}</p>
                  <p className="text-xs text-muted-foreground">{team.memberCount} Active Members</p>
                </div>
              </div>
              <span className="text-lg font-bold text-indigo-400">{team.activityCount}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No team activity in this period.</p>
      )}
    </section>
  );
}

function VelocityCard({ ms, sampleSize }: { ms?: number; sampleSize?: number }) {
  const formatted = formatVelocity(ms);
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-6 text-center">
      <Zap className="mb-2 h-8 w-8 text-indigo-400" />
      <p className="mb-1 text-sm font-semibold text-foreground">Deployment Velocity</p>
      {formatted ? (
        <>
          <p className="text-3xl font-bold text-foreground">{formatted}</p>
          <p className="mt-1 text-xs text-muted-foreground">Average time to 100% rollout</p>
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
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data: flags, isLoading: loadingFlags } = useLaunchedWins();
  const { data: teams, isLoading: loadingTeams } = useTopTeams();
  const { data: velocity } = useVelocity();

  return (
    <div className="px-10 py-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Executive Impact</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cross-functional visibility and deployment velocity.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600/10 px-3 py-1 text-xs font-medium text-indigo-400">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
          Live Audit Tracking
        </span>
      </div>

      {/* Launched Wins */}
      {loadingFlags ? (
        <div className="mb-8 h-48 animate-pulse rounded-xl bg-card" />
      ) : (
        <LaunchedWinsSection flags={flags ?? []} />
      )}

      {/* Bottom row: Top Teams + Velocity */}
      <div className="grid grid-cols-[1fr_240px] gap-5">
        {loadingTeams ? (
          <div className="h-48 animate-pulse rounded-xl bg-card" />
        ) : (
          <TopTeamsSection teams={teams ?? []} />
        )}
        <VelocityCard ms={velocity?.averageMs} sampleSize={velocity?.sampleSize} />
      </div>
    </div>
  );
}
