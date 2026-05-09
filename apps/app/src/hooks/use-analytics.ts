"use client";

import { useApiToken } from "@/hooks/use-api-token";
import { apiFetch } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

// ─── Types (match actual backend shapes) ─────────────────────────────────────

export type TeamActivity = {
  teamName: string;
  changeCount: number;
};

export type LaunchedFlag = {
  flagKey: string;
  flagName: string;
  actorEmail: string;
  actorName: string;
  rolloutPercentage: number;
  occurredAt: string;
};

// Frontend-normalised — backend sends minutes, hook converts to ms for formatVelocity.
export type VelocityData = {
  averageMs: number | undefined;
  sampleSize: number;
};

export type AuditLogEntry = {
  occurredAt: string;
  flagName: string;
  flagKey: string;
  actorEmail: string;
  actorName: string;
  eventType: string;
  environments: string[];
};

export type AuditLogPage = {
  total: number;
  page: number;
  count: number;
  data: AuditLogEntry[];
};

export type PullRequestUser = {
  login: string;
  id: number;
};

export type PullRequestRepository = {
  owner: string;
  name: string;
  id: string;
};

export type PullRequestState = "merged" | "closed" | (string & {});

export type PullRequestEnrichmentStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "failed"
  | (string & {});

export type PullRequestData = {
  key: string;
  title: string;
  state: PullRequestState;
  url: string;
  number: number;
  repository: PullRequestRepository;
  author: PullRequestUser;
  labels: string[];
  assignees: PullRequestUser[];
  createdAt?: string;
  mergedAt?: string;
  diff: {
    sha: string;
    branches: {
      source: string;
      target: string;
    };
    stats: {
      additions: number;
      deletions: number;
      changedFiles: number;
    };
  };
  enrichment: {
    status: PullRequestEnrichmentStatus;
    enrichedAt?: string | null;
    featureFlags: {
      added: string[];
      removed: string[];
    };
  };
};

export type PullRequestsPage = {
  total: number;
  page: number;
  count: number;
  data: PullRequestData[];
};

export type DateRange = { from: string; to: string };

// Backend requires RFC3339 timestamps, not bare dates.
export function makeDateRange(days: number): DateRange {
  const to = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .replace(/\.\d{3}Z$/, "Z");
  return { from, to };
}

// ─── Response envelope helpers ────────────────────────────────────────────────

type Envelope<K extends string, D> = {
  orgId: string;
  from: string;
  to: string;
  data: Record<K, D>;
};

function buildUrl(metric: string, range: DateRange, extra: Record<string, string> = {}) {
  const params = new URLSearchParams({ metric, from: range.from, to: range.to, ...extra });
  return `/v1/analytics?${params}`;
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useTopTeams(range: DateRange) {
  const token = useApiToken();

  return useQuery({
    queryKey: ["top-teams", range, token],
    enabled: !!token,
    retry: false,
    staleTime: 60_000,
    queryFn: async () => {
      const res = await apiFetch<Envelope<"top_teams", { teams: TeamActivity[] }>>(
        buildUrl("top_teams", range),
        { token }
      );
      return res?.data?.top_teams?.teams ?? [];
    },
  });
}

export function useLaunchedWins(range: DateRange) {
  const token = useApiToken();

  return useQuery({
    queryKey: ["launched-wins", range, token],
    enabled: !!token,
    retry: false,
    staleTime: 60_000,
    queryFn: async () => {
      const res = await apiFetch<Envelope<"launched_wins", { wins: LaunchedFlag[] }>>(
        buildUrl("launched_wins", range),
        { token }
      );
      return res?.data?.launched_wins?.wins ?? [];
    },
  });
}

export function useVelocity(range: DateRange) {
  const token = useApiToken();

  return useQuery({
    queryKey: ["velocity", range, token],
    enabled: !!token,
    retry: false,
    staleTime: 60_000,
    queryFn: async () => {
      type VelocityBackend = { averageTimeToFullRolloutMinutes: number; sampleSize: number };
      const res = await apiFetch<Envelope<"velocity", VelocityBackend>>(
        buildUrl("velocity", range),
        { token }
      );
      const raw = res?.data?.velocity;
      if (!raw) return { averageMs: undefined, sampleSize: 0 } satisfies VelocityData;
      return {
        averageMs: raw.averageTimeToFullRolloutMinutes * 60_000,
        sampleSize: raw.sampleSize,
      } satisfies VelocityData;
    },
  });
}

export function useAuditLog(range: DateRange, page: number) {
  const token = useApiToken();

  return useQuery({
    queryKey: ["audit-log", range, page, token],
    enabled: !!token,
    retry: false,
    staleTime: 30_000,
    queryFn: async () => {
      const res = await apiFetch<Envelope<"audit_log", AuditLogPage>>(
        buildUrl("audit_log", range, { page: String(page), limit: "25" }),
        { token }
      );
      return res?.data?.audit_log ?? null;
    },
  });
}

export function usePullRequests(range: DateRange, page: number, limit = 25) {
  const token = useApiToken();

  return useQuery({
    queryKey: ["pull-requests", range, page, limit, token],
    enabled: !!token,
    retry: false,
    staleTime: 30_000,
    queryFn: async () => {
      const res = await apiFetch<Envelope<"pull_requests", PullRequestsPage>>(
        buildUrl("pull_requests", range, { page: String(page), limit: String(limit) }),
        { token }
      );
      return res?.data?.pull_requests ?? null;
    },
  });
}
