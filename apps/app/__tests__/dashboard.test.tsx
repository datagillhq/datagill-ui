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

const emptyAuditLog: analytics.AuditLogPage = { data: [], total: 0, page: 1, count: 0 };

function setup({
  flags = [],
  teams = [],
  velocity = {} as analytics.VelocityData,
  auditLog = emptyAuditLog,
  loading = false,
}: {
  flags?: analytics.LaunchedFlag[];
  teams?: analytics.TeamActivity[];
  velocity?: Partial<analytics.VelocityData>;
  auditLog?: analytics.AuditLogPage | null;
  loading?: boolean;
} = {}) {
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
    data: auditLog,
    isLoading: loading,
  } as ReturnType<typeof analytics.useAuditLog>);
  render(<DashboardPage />);
}

describe("DashboardPage", () => {
  it("renders header and date picker", () => {
    setup();
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /last 7 days/i })).toBeInTheDocument();
  });

  it("shows skeletons while loading", () => {
    setup({ loading: true });
    expect(document.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  // ── Stat strip ─────────────────────────────────────────────────────────────

  it("stat strip shows launch count", () => {
    setup({
      flags: [
        {
          flagKey: "k1",
          flagName: "A",
          actorEmail: "a@b.com",
          actorName: "A",
          rolloutPercentage: 100,
          occurredAt: "2024-05-01T00:00:00Z",
        },
        {
          flagKey: "k2",
          flagName: "B",
          actorEmail: "a@b.com",
          actorName: "A",
          rolloutPercentage: 100,
          occurredAt: "2024-05-02T00:00:00Z",
        },
      ],
    });
    expect(screen.getByText("2")).toBeInTheDocument(); // launched count
  });

  it("stat strip shows velocity", () => {
    setup({ velocity: { averageMs: 744_000, sampleSize: 5 } });
    expect(screen.getByText("12m")).toBeInTheDocument();
  });

  it("stat strip shows low sample sub-text", () => {
    setup({ velocity: { averageMs: 60_000, sampleSize: 2 } });
    expect(screen.getByText(/low sample/i)).toBeInTheDocument();
  });

  it("stat strip shows — when no velocity", () => {
    setup({ velocity: {} });
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("stat strip shows total events from audit log", () => {
    setup({ auditLog: { ...emptyAuditLog, total: 42 } });
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  // ── Activity log ───────────────────────────────────────────────────────────

  it("shows empty state with helpful copy when no activity", () => {
    setup();
    expect(screen.getByText("No activity yet")).toBeInTheDocument();
  });

  it("renders activity log rows", () => {
    setup({
      auditLog: {
        total: 1,
        page: 1,
        count: 1,
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
      },
    });
    expect(screen.getByText("Apple Pay")).toBeInTheDocument();
    expect(screen.getByText("Sarah Jenkins")).toBeInTheDocument();
    expect(screen.getByText("toggled")).toBeInTheDocument();
    expect(screen.getByText("production")).toBeInTheDocument();
  });

  it("shows pagination when total > 25", () => {
    const data = Array.from({ length: 25 }, (_, i) => ({
      occurredAt: "2024-05-12T00:00:00Z",
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

  // ── Launched wins ──────────────────────────────────────────────────────────

  it("shows empty state for launched wins", () => {
    setup({ flags: [] });
    expect(screen.getByText("No launches yet")).toBeInTheDocument();
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
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  // ── Top teams ──────────────────────────────────────────────────────────────

  it("shows empty state for top teams", () => {
    setup({ teams: [] });
    expect(screen.getByText("No team activity")).toBeInTheDocument();
  });

  it("renders ranked team list", () => {
    setup({
      teams: [
        { teamName: "Platform Eng", changeCount: 842 },
        { teamName: "Revenue", changeCount: 200 },
      ],
    });
    expect(screen.getByText("Platform Eng")).toBeInTheDocument();
    expect(screen.getByText("842")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument(); // rank number
  });

  // ── Date picker ────────────────────────────────────────────────────────────

  it("opens date range dropdown and switches range", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: /last 7 days/i }));
    expect(screen.getByText("Last 30 days")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Last 30 days"));
    expect(screen.queryByText("Last 90 days")).not.toBeInTheDocument();
  });
});
