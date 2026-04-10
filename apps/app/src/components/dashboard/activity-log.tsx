import type { AuditLogEntry, AuditLogPage } from "@/hooks/use-analytics";
import { ChevronLeft, ChevronRight } from "lucide-react";

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
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

function EventBadge({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center rounded border border-border px-2 py-0.5 text-[10px] font-medium capitalize text-muted-foreground">
      {type}
    </span>
  );
}

type Props = {
  auditLog?: AuditLogPage | null;
  loading: boolean;
  page: number;
  onPageChange: (p: number) => void;
};

export function ActivityLog({ auditLog, loading, page, onPageChange }: Props) {
  const limit = 25;
  const total = auditLog?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const from = total > 0 ? (page - 1) * limit + 1 : 0;
  const to = Math.min(page * limit, total);
  const entries: AuditLogEntry[] = auditLog?.data ?? [];

  return (
    <section className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Activity Log</h2>
        {total > 0 && (
          <span className="text-xs text-muted-foreground">
            {from}–{to} of {total}
          </span>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card">
        {loading ? (
          <div className="space-y-px">
            {Array.from({ length: 5 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <div className="h-3 w-28 animate-pulse rounded bg-muted" />
                <div className="h-3 w-40 animate-pulse rounded bg-muted" />
                <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                <div className="h-3 w-16 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : (
          <>
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
                {entries.length > 0 ? (
                  entries.map((e, i) => (
                    <tr
                      key={`${e.flagKey}-${e.occurredAt}-${i}`}
                      className="border-b border-border last:border-0 hover:bg-muted/30"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
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
                        <EventBadge type={e.eventType} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {e.environments.length > 0 ? (
                            e.environments.map((env) => (
                              <span
                                key={env}
                                className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground"
                              >
                                {env}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <p className="text-sm font-medium text-foreground">No activity yet</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Flag changes will appear here once an integration is syncing.
                      </p>
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
                  className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
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
                  className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
