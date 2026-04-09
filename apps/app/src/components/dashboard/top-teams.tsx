import type { TeamActivity } from "@/hooks/use-analytics";

type Props = {
  teams?: TeamActivity[];
  loading: boolean;
};

export function TopTeams({ teams, loading }: Props) {
  return (
    <div className="flex flex-col">
      <h2 className="mb-3 text-base font-semibold text-foreground">Top Teams</h2>
      <div className="flex-1 rounded-xl border border-border bg-card p-4">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
              <div key={i} className="flex items-center justify-between">
                <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                <div className="h-3 w-8 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : teams && teams.length > 0 ? (
          <ol className="space-y-2">
            {teams.slice(0, 6).map((team, i) => (
              <li
                key={team.teamName}
                className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted/40"
              >
                <div className="flex items-center gap-3">
                  <span className="w-4 text-center text-[11px] font-semibold text-muted-foreground">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-foreground">{team.teamName}</span>
                </div>
                <span className="text-sm font-bold text-indigo-400">{team.changeCount}</span>
              </li>
            ))}
          </ol>
        ) : (
          <div className="flex h-full flex-col items-center justify-center py-6 text-center">
            <p className="text-sm font-medium text-foreground">No team activity</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Changes will be attributed to teams once flags sync.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
