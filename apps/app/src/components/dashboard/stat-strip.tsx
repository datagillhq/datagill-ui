import type { AuditLogPage, LaunchedFlag, TeamActivity, VelocityData } from "@/hooks/use-analytics";

function formatVelocity(ms?: number): string {
  if (!ms) return "—";
  if (ms < 60_000) return `${Math.round(ms / 1_000)}s`;
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)}m`;
  if (ms < 86_400_000) {
    const h = Math.floor(ms / 3_600_000);
    const m = Math.round((ms % 3_600_000) / 60_000);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${Math.round(ms / 86_400_000)}d`;
}

type StatCardProps = {
  label: string;
  value: string | number;
  sub: string;
  loading?: boolean;
};

function StatCard({ label, value, sub, loading }: StatCardProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-3 h-3 w-20 animate-pulse rounded bg-muted" />
        <div className="mb-2 h-7 w-12 animate-pulse rounded bg-muted" />
        <div className="h-3 w-28 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="mb-1 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

type Props = {
  flags?: LaunchedFlag[];
  teams?: TeamActivity[];
  velocity?: VelocityData;
  auditLog?: AuditLogPage | null;
  loading: boolean;
};

export function StatStrip({ flags, teams, velocity, auditLog, loading }: Props) {
  const velocityStr = formatVelocity(velocity?.averageMs);
  const velocitySub =
    velocity?.sampleSize != null && velocity.sampleSize < 3 && velocity.averageMs
      ? `low sample (${velocity.sampleSize} flags)`
      : "avg. time to full rollout";

  return (
    <div className="mb-6 grid grid-cols-4 gap-4">
      <StatCard
        label="Launched"
        value={flags?.length ?? 0}
        sub="flags this period"
        loading={loading}
      />
      <StatCard
        label="Teams Active"
        value={teams?.length ?? 0}
        sub="teams with changes"
        loading={loading}
      />
      <StatCard label="Avg. Velocity" value={velocityStr} sub={velocitySub} loading={loading} />
      <StatCard
        label="Events"
        value={auditLog?.total ?? 0}
        sub="changes recorded"
        loading={loading}
      />
    </div>
  );
}
