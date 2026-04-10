import type { LaunchedFlag } from "@/hooks/use-analytics";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

function ActorAvatar({ name }: { name?: string }) {
  const label = name?.slice(0, 2).toUpperCase() ?? "?";
  return (
    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600/20 text-[10px] font-semibold text-indigo-400">
      {label}
    </span>
  );
}

function RolloutBadge({ pct }: { pct: number }) {
  const is100 = pct === 100;
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
        is100 ? "bg-indigo-600 text-white" : "border border-border text-muted-foreground"
      }`}
    >
      {pct}%
    </span>
  );
}

type Props = {
  flags?: LaunchedFlag[];
  loading: boolean;
};

export function LaunchedWins({ flags, loading }: Props) {
  return (
    <div className="flex flex-col">
      <h2 className="mb-3 text-base font-semibold text-foreground">Launched Wins</h2>
      <div className="flex-1 rounded-xl border border-border bg-card">
        {loading ? (
          <div className="space-y-px p-4">
            {Array.from({ length: 3 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
              <div key={i} className="flex items-center gap-4 py-2">
                <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                <div className="h-3 w-12 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">Flag</th>
                <th className="px-4 py-3 text-left font-medium">Actor</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {flags && flags.length > 0 ? (
                flags.map((f, i) => (
                  <tr
                    key={`${f.flagKey}-${i}`}
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
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                      {formatDate(f.occurredAt)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center">
                    <p className="text-sm font-medium text-foreground">No launches yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Flags reaching 100% rollout will appear here.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
