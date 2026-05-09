import { PullRequests } from "@/components/dashboard/pull-requests";
import type { PullRequestData, PullRequestsPage } from "@/hooks/use-analytics";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

function makePullRequest(overrides: Partial<PullRequestData> = {}): PullRequestData {
  return {
    key: "github:acme/web:42",
    title: "Add checkout flag",
    state: "merged",
    url: "https://github.com/acme/web/pull/42",
    number: 42,
    repository: {
      owner: "acme",
      name: "web",
      id: "repo-1",
    },
    author: {
      login: "sarah",
      id: 1,
    },
    labels: ["feature"],
    assignees: [],
    createdAt: "2026-04-05T14:12:00Z",
    mergedAt: "2026-04-05T16:30:00Z",
    diff: {
      sha: "abc123",
      branches: {
        source: "feature/checkout",
        target: "main",
      },
      stats: {
        additions: 120,
        deletions: 8,
        changedFiles: 4,
      },
    },
    enrichment: {
      status: "completed",
      enrichedAt: "2026-04-05T17:00:00Z",
      featureFlags: {
        added: ["checkout-v2", "apple-pay"],
        removed: ["old-checkout"],
      },
    },
    ...overrides,
  };
}

function makePage(data: PullRequestData[], total = data.length): PullRequestsPage {
  return {
    total,
    page: 1,
    count: data.length,
    data,
  };
}

describe("PullRequests", () => {
  it("shows skeletons while loading", () => {
    render(<PullRequests loading page={1} onPageChange={vi.fn()} />);

    expect(document.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("shows an empty state", () => {
    render(
      <PullRequests pullRequests={makePage([])} loading={false} page={1} onPageChange={vi.fn()} />
    );

    expect(screen.getByText("No pull requests yet")).toBeInTheDocument();
    expect(screen.getByText(/GitHub pull requests will appear here/i)).toBeInTheDocument();
  });

  it("renders populated rows", () => {
    render(
      <PullRequests
        pullRequests={makePage([makePullRequest()])}
        loading={false}
        page={1}
        onPageChange={vi.fn()}
      />
    );

    const link = screen.getByRole("link", { name: /Add checkout flag/i });
    expect(link).toHaveAttribute("href", "https://github.com/acme/web/pull/42");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer noopener");
    expect(screen.getByText("acme/web #42")).toBeInTheDocument();
    expect(screen.getByText("sarah")).toBeInTheDocument();
    expect(screen.getByText("merged")).toBeInTheDocument();
    expect(screen.getByText("2 added / 1 removed")).toBeInTheDocument();
    expect(screen.getByText("completed")).toBeInTheDocument();
  });

  it("handles omitted timestamps", () => {
    render(
      <PullRequests
        pullRequests={makePage([
          makePullRequest({
            createdAt: undefined,
            mergedAt: undefined,
            enrichment: {
              status: "completed",
              enrichedAt: null,
              featureFlags: {
                added: [],
                removed: [],
              },
            },
          }),
        ])}
        loading={false}
        page={1}
        onPageChange={vi.fn()}
      />
    );

    const row = screen.getByRole("link", { name: /Add checkout flag/i }).closest("tr");
    expect(row).not.toBeNull();
    expect(within(row as HTMLElement).getAllByText("—")).toHaveLength(2);
    expect(screen.getByText("No flag changes")).toBeInTheDocument();
  });

  it("renders pending enrichment", () => {
    render(
      <PullRequests
        pullRequests={makePage([
          makePullRequest({
            enrichment: {
              status: "pending",
              enrichedAt: null,
              featureFlags: {
                added: [],
                removed: [],
              },
            },
          }),
        ])}
        loading={false}
        page={1}
        onPageChange={vi.fn()}
      />
    );

    expect(screen.getByText("pending")).toBeInTheDocument();
    expect(screen.getByText("No flag changes")).toBeInTheDocument();
  });

  it("supports pagination", () => {
    const onPageChange = vi.fn();
    const data = Array.from({ length: 25 }, (_, i) =>
      makePullRequest({
        key: `github:acme/web:${i}`,
        title: `Pull request ${i}`,
        number: i,
      })
    );

    render(
      <PullRequests
        pullRequests={makePage(data, 50)}
        loading={false}
        page={1}
        onPageChange={onPageChange}
      />
    );

    expect(screen.getByText("1–25 of 50")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
