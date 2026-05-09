import type { PullRequestData, PullRequestsPage } from "@/hooks/use-analytics";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

function formatOptionalTime(iso?: string | null) {
  if (!iso) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}

function StatusBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded border border-border px-2 py-0.5 text-[10px] font-medium capitalize text-muted-foreground">
      {label.replaceAll("_", " ")}
    </span>
  );
}

function flagSummary(pr: PullRequestData) {
  const added = pr.enrichment.featureFlags.added.length;
  const removed = pr.enrichment.featureFlags.removed.length;

  if (added === 0 && removed === 0) return "No flag changes";
  return `${added} added / ${removed} removed`;
}

type Props = {
  pullRequests?: PullRequestsPage | null;
  loading: boolean;
  page: number;
  onPageChange: (p: number) => void;
};

export function PullRequests({ pullRequests, loading, page, onPageChange }: Props) {
  const limit = 25;
  const total = pullRequests?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const from = total > 0 ? (page - 1) * limit + 1 : 0;
  const to = Math.min(page * limit, total);
  const entries: PullRequestData[] = pullRequests?.data ?? [];

  return (
    <section className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Pull Requests</h2>
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
                <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                <div className="h-3 w-56 animate-pulse rounded bg-muted" />
                <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                <div className="h-3 w-20 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="px-4 py-3 text-left font-medium">Created</th>
                  <th className="px-4 py-3 text-left font-medium">Pull Request</th>
                  <th className="px-4 py-3 text-left font-medium">Author</th>
                  <th className="px-4 py-3 text-left font-medium">State</th>
                  <th className="px-4 py-3 text-left font-medium">Flags</th>
                  <th className="px-4 py-3 text-left font-medium">Enrichment</th>
                </tr>
              </thead>
              <tbody>
                {entries.length > 0 ? (
                  entries.map((pr) => (
                    <tr
                      key={pr.key}
                      className="border-b border-border last:border-0 hover:bg-muted/30"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                        {formatOptionalTime(pr.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={pr.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1 font-medium text-foreground hover:text-indigo-400"
                        >
                          {pr.title}
                          <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        </a>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {pr.repository.owner}/{pr.repository.name} #{pr.number}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{pr.author.login}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-start gap-1">
                          <StatusBadge label={pr.state} />
                          {pr.mergedAt && (
                            <span className="text-[10px] text-muted-foreground">
                              Merged {formatOptionalTime(pr.mergedAt)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{flagSummary(pr)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-start gap-1">
                          <StatusBadge label={pr.enrichment.status} />
                          <span className="text-[10px] text-muted-foreground">
                            {formatOptionalTime(pr.enrichment.enrichedAt)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <p className="text-sm font-medium text-foreground">No pull requests yet</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        GitHub pull requests will appear here once an integration is syncing.
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
