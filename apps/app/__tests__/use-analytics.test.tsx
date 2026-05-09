import { type DateRange, usePullRequests } from "@/hooks/use-analytics";
import { apiFetch } from "@/lib/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/use-api-token", () => ({ useApiToken: vi.fn(() => "jwt-123") }));
vi.mock("@/lib/api", () => ({ apiFetch: vi.fn() }));

const range: DateRange = {
  from: "2026-05-01T00:00:00Z",
  to: "2026-05-08T00:00:00Z",
};

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("usePullRequests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches pull request analytics and extracts the envelope data", async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      orgId: "org-1",
      from: range.from,
      to: range.to,
      data: {
        pull_requests: {
          total: 1,
          page: 2,
          count: 2,
          data: [
            {
              key: "pr-uuid",
              title: "feat: add checkout flag",
              state: "merged",
              url: "https://github.com/acme/web/pull/42",
              number: 42,
              repository: { owner: "acme", name: "web", id: "123456" },
              author: { login: "ariel", id: 12345 },
              labels: ["feature"],
              assignees: [],
              createdAt: "2026-05-01T10:00:00Z",
              mergedAt: "2026-05-02T10:00:00Z",
              diff: {
                sha: "abc123",
                branches: { source: "feat/checkout", target: "main" },
                stats: { additions: 120, deletions: 45, changedFiles: 8 },
              },
              enrichment: {
                status: "completed",
                enrichedAt: "2026-05-02T10:10:00Z",
                featureFlags: { added: ["flag-uuid"], removed: [] },
              },
            },
            {
              key: "pending-pr-uuid",
              title: "chore: update dependencies",
              state: "merged",
              url: "https://github.com/acme/web/pull/43",
              number: 43,
              repository: { owner: "acme", name: "web", id: "123456" },
              author: { login: "jules", id: 23456 },
              labels: [],
              assignees: [],
              diff: {
                sha: "def456",
                branches: { source: "deps", target: "main" },
                stats: { additions: 12, deletions: 4, changedFiles: 2 },
              },
              enrichment: {
                status: "pending",
                featureFlags: { added: [], removed: [] },
              },
            },
          ],
        },
      },
    });

    const { result } = renderHook(() => usePullRequests(range, 2), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiFetch).toHaveBeenCalledWith(
      "/v1/analytics?metric=pull_requests&from=2026-05-01T00%3A00%3A00Z&to=2026-05-08T00%3A00%3A00Z&page=2&limit=25",
      { token: "jwt-123" }
    );
    expect(result.current.data?.data[0]?.repository.name).toBe("web");
    expect(result.current.data?.data[0]?.enrichment.featureFlags.added).toEqual(["flag-uuid"]);
    expect(result.current.data?.data[1]?.createdAt).toBeUndefined();
    expect(result.current.data?.data[1]?.mergedAt).toBeUndefined();
    expect(result.current.data?.data[1]?.enrichment.enrichedAt).toBeUndefined();
  });
});
