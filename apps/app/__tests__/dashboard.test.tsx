import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/use-analytics", () => ({
  useLaunchedWins: vi.fn(),
  useTopTeams: vi.fn(),
  useVelocity: vi.fn(),
  useAuditLog: vi.fn(),
  makeDateRange: (_days: number) => ({
    from: "2026-04-01T00:00:00Z",
    to: "2026-04-08T00:00:00Z",
  }),
}));

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

import DashboardPage from "@/app/(app)/(main)/dashboard/page";
import * as analytics from "@/hooks/use-analytics";

const emptyAuditLog = { data: [], total: 0, page: 1, count: 0 };

function setup({
  flags = [],
  teams = [],
  velocity = {},
  auditLog = emptyAuditLog,
  loading = false,
}: {
  flags?: analytics.LaunchedFlag[];
  teams?: analytics.TeamActivity[];
  velocity?: Partial<analytics.VelocityData>;
  auditLog?: Partial<analytics.AuditLogPage> | null;
  loading?: boolean;
}) {
  vi.mocked(analytics.useLaunchedWins).mockReturnValue({
    data: flags,
    isLoading: loading,
  } as ReturnType<typeof analytics.useLaunchedWins>);
  vi.mocked(analytics.useTopTeams).mockReturnValue({
    data: teams,
    isLoading: loading,
  } as ReturnType<typeof analytics.useTopTeams>);
  vi.mocked(analytics.useVelocity).mockReturnValue({
    data: velocity as analytics.VelocityData,
    isLoading: loading,
  } as ReturnType<typeof analytics.useVelocity>);
  vi.mocked(analytics.useAuditLog).mockReturnValue({
    data: auditLog as analytics.AuditLogPage,
    isLoading: loading,
  } as ReturnType<typeof analytics.useAuditLog>);
  render(<DashboardPage />);
}

describe("DashboardPage", () => {
  it("renders the header", () => {
    setup({});
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Last 7 days")).toBeInTheDocument();
  });

  it("shows skeletons while loading", () => {
    setup({ loading: true });
    expect(document.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("shows empty state for launched wins when no data", () => {
    setup({ flags: [] });
    expect(screen.getByText("No flags reached 100% rollout in this period.")).toBeInTheDocument();
  });

  it("renders launched wins rows", () => {
    setup({
      flags: [
        {
          flagKey: "uuid-1",
          flagName: "apple-pay",
          actorName: "Marcus Chen",
          actorEmail: "marcus@acme.com",
          rolloutPercentage: 100,
          occurredAt: "2024-05-12T14:00:00Z",
        },
      ],
    });
    expect(screen.getByText("apple-pay")).toBeInTheDocument();
    expect(screen.getByText("Marcus Chen")).toBeInTheDocument();
    expect(screen.getByText("100% Rollout")).toBeInTheDocument();
  });

  it("shows empty state for top teams when no data", () => {
    setup({ teams: [] });
    expect(screen.getByText("No team activity in this period.")).toBeInTheDocument();
  });

  it("renders top team cards", () => {
    setup({
      teams: [{ teamName: "Platform Eng", changeCount: 842 }],
    });
    expect(screen.getByText("Platform Eng")).toBeInTheDocument();
    expect(screen.getByText("842")).toBeInTheDocument();
  });

  it("shows velocity when data is available", () => {
    setup({ velocity: { averageMs: 744_000, sampleSize: 5 } });
    expect(screen.getByText("12m")).toBeInTheDocument();
    expect(screen.getByText("avg. time to 100% rollout")).toBeInTheDocument();
  });

  it("shows low sample size warning", () => {
    setup({ velocity: { averageMs: 60_000, sampleSize: 2 } });
    expect(screen.getByText(/low sample size/i)).toBeInTheDocument();
  });

  it("shows not enough data when velocity is empty", () => {
    setup({ velocity: {} });
    expect(screen.getByText("Not enough data yet.")).toBeInTheDocument();
  });

  it("opens date range dropdown and switches range", async () => {
    setup({});
    fireEvent.click(screen.getByRole("button", { name: /last 7 days/i }));
    expect(screen.getByRole("button", { name: /last 30 days/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /last 30 days/i }));
    expect(screen.queryByRole("button", { name: /last 90 days/i })).not.toBeInTheDocument();
  });

  it("shows empty audit log state", () => {
    setup({ auditLog: { data: [], total: 0, page: 1, count: 0 } });
    expect(screen.getByText("No activity recorded in this period.")).toBeInTheDocument();
  });

  it("renders audit log rows", () => {
    setup({
      auditLog: {
        data: [
          {
            occurredAt: "2024-05-12T14:12:04Z",
            flagName: "Apple Pay",
            flagKey: "uuid-1",
            actorEmail: "sarah@acme.com",
            actorName: "Sarah Jenkins",
            eventType: "toggled",
            environments: ["production"],
          },
        ],
        total: 1,
        page: 1,
        count: 1,
      },
    });
    expect(screen.getByText("Apple Pay")).toBeInTheDocument();
    expect(screen.getByText("Sarah Jenkins")).toBeInTheDocument();
    expect(screen.getByText("toggled")).toBeInTheDocument();
    expect(screen.getByText("production")).toBeInTheDocument();
  });

  it("shows pagination controls when total > 25", () => {
    const data = Array.from({ length: 25 }, (_, i) => ({
      occurredAt: "2024-05-12T14:00:00Z",
      flagName: `flag-${i}`,
      flagKey: `uuid-${i}`,
      actorEmail: "a@b.com",
      actorName: "Actor",
      eventType: "toggled",
      environments: ["production"],
    }));
    setup({ auditLog: { data, total: 50, page: 1, count: 25 } });
    expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
  });
});
