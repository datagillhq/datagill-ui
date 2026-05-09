"use client";

import { ActivityLog } from "@/components/dashboard/activity-log";
import { LaunchedWins } from "@/components/dashboard/launched-wins";
import { PullRequests } from "@/components/dashboard/pull-requests";
import { StatStrip } from "@/components/dashboard/stat-strip";
import { TopTeams } from "@/components/dashboard/top-teams";
import {
  makeDateRange,
  useAuditLog,
  useLaunchedWins,
  usePullRequests,
  useTopTeams,
  useVelocity,
} from "@/hooks/use-analytics";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const DATE_PRESETS = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
] as const;

export default function DashboardPage() {
  const [days, setDays] = useState<7 | 30 | 90>(7);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [auditPage, setAuditPage] = useState(1);
  const [pullRequestsPage, setPullRequestsPage] = useState(1);
  const range = makeDateRange(days);

  const { data: flags, isLoading: loadingFlags } = useLaunchedWins(range);
  const { data: teams, isLoading: loadingTeams } = useTopTeams(range);
  const { data: velocity, isLoading: loadingVelocity } = useVelocity(range);
  const { data: auditLog, isLoading: loadingAudit } = useAuditLog(range, auditPage);
  const { data: pullRequests, isLoading: loadingPullRequests } = usePullRequests(
    range,
    pullRequestsPage
  );

  const selectedLabel = DATE_PRESETS.find((p) => p.days === days)?.label ?? "Last 7 days";
  const statsLoading = loadingFlags || loadingTeams || loadingVelocity || loadingAudit;

  function handleDaysChange(d: 7 | 30 | 90) {
    setDays(d);
    setAuditPage(1);
    setPullRequestsPage(1);
    setDropdownOpen(false);
  }

  return (
    <div className="px-10 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cross-functional visibility across your feature flag deployments.
          </p>
        </div>

        {/* Date range picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen((o) => !o)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            {selectedLabel}
            <ChevronDown className="h-3 w-3" />
          </button>
          {dropdownOpen && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-10 cursor-default"
                aria-label="Close dropdown"
                tabIndex={-1}
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-lg border border-border bg-card py-1 shadow-lg">
                {DATE_PRESETS.map((preset) => (
                  <button
                    key={preset.days}
                    type="button"
                    onClick={() => handleDaysChange(preset.days)}
                    className={`flex w-full items-center justify-between px-3 py-2 text-xs hover:bg-muted ${
                      days === preset.days ? "text-indigo-400" : "text-foreground"
                    }`}
                  >
                    {preset.label}
                    {days === preset.days && (
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stat strip */}
      <StatStrip
        flags={flags}
        teams={teams}
        velocity={velocity}
        auditLog={auditLog}
        loading={statsLoading}
      />

      {/* Activity Log — hero section */}
      <ActivityLog
        auditLog={auditLog}
        loading={loadingAudit}
        page={auditPage}
        onPageChange={setAuditPage}
      />

      <PullRequests
        pullRequests={pullRequests}
        loading={loadingPullRequests}
        page={pullRequestsPage}
        onPageChange={setPullRequestsPage}
      />

      {/* Bottom: Launched Wins + Top Teams */}
      <div className="grid grid-cols-[1fr_280px] gap-5">
        <LaunchedWins flags={flags} loading={loadingFlags} />
        <TopTeams teams={teams} loading={loadingTeams} />
      </div>
    </div>
  );
}
