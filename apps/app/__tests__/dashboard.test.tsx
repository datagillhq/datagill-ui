import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/use-analytics", () => ({
  useLaunchedWins: vi.fn(),
  useTopTeams: vi.fn(),
  useVelocity: vi.fn(),
  makeDateRange: (_days: number) => ({
    from: "2026-04-01",
    to: "2026-04-08",
  }),
}));

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

import DashboardPage from "@/app/(app)/(main)/dashboard/page";
import * as analytics from "@/hooks/use-analytics";

function setup({
  flags = [],
  teams = [],
  velocity = {},
  loading = false,
}: {
  flags?: analytics.LaunchedFlag[];
  teams?: analytics.TeamActivity[];
  velocity?: analytics.VelocityData;
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
    data: velocity,
    isLoading: loading,
  } as ReturnType<typeof analytics.useVelocity>);
  render(<DashboardPage />);
}

describe("DashboardPage", () => {
  it("renders the header", () => {
    setup({});
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Last 7 days")).toBeInTheDocument();
  });

  it("shows empty state for launched wins when no data", () => {
    setup({ flags: [] });
    expect(screen.getByText("No flags reached 100% rollout in this period.")).toBeInTheDocument();
  });

  it("renders launched wins rows", () => {
    setup({
      flags: [
        {
          name: "apple-pay",
          actorName: "Marcus Chen",
          rolloutPercentage: 100,
          date: "2024-05-12",
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
      teams: [{ name: "Platform Eng", memberCount: 8, activityCount: 842 }],
    });
    expect(screen.getByText("Platform Eng")).toBeInTheDocument();
    expect(screen.getByText("8 Active Members")).toBeInTheDocument();
    expect(screen.getByText("842")).toBeInTheDocument();
  });

  it("shows velocity when data is available", () => {
    setup({ velocity: { averageMs: 744_000, sampleSize: 5 } });
    expect(screen.getByText("12m")).toBeInTheDocument();
    expect(screen.getByText("Average time to 100% rollout")).toBeInTheDocument();
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
});
