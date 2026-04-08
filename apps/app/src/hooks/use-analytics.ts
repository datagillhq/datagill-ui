"use client";

import { apiFetch } from "@/lib/api";
import { useSession } from "@datagill/auth/client";
import { useQuery } from "@tanstack/react-query";

export type TeamActivity = {
  name: string;
  memberCount: number;
  activityCount: number;
};

export type LaunchedFlag = {
  name: string;
  sourceUrl?: string;
  actorName?: string;
  actorInitials?: string;
  rolloutPercentage?: number;
  date: string;
};

export type VelocityData = {
  averageMs?: number;
  sampleSize?: number;
};

export type DateRange = { from: string; to: string };

export function makeDateRange(days: number): DateRange {
  const to = new Date().toISOString().split("T")[0];
  const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  return { from, to };
}

export function useTopTeams(range: DateRange) {
  const { data: session } = useSession();
  const token = session?.session?.token ?? null;

  return useQuery({
    queryKey: ["top-teams", range, token],
    enabled: !!token,
    queryFn: () =>
      apiFetch<TeamActivity[]>(`/v1/analytics?metric=top_teams&from=${range.from}&to=${range.to}`, {
        token,
      }),
    retry: false,
    staleTime: 60_000,
  });
}

export function useLaunchedWins(range: DateRange) {
  const { data: session } = useSession();
  const token = session?.session?.token ?? null;

  return useQuery({
    queryKey: ["launched-wins", range, token],
    enabled: !!token,
    queryFn: () =>
      apiFetch<LaunchedFlag[]>(
        `/v1/analytics?metric=launched_wins&from=${range.from}&to=${range.to}`,
        { token }
      ),
    retry: false,
    staleTime: 60_000,
  });
}

export function useVelocity(range: DateRange) {
  const { data: session } = useSession();
  const token = session?.session?.token ?? null;

  return useQuery({
    queryKey: ["velocity", range, token],
    enabled: !!token,
    queryFn: () =>
      apiFetch<VelocityData>(`/v1/analytics?metric=velocity&from=${range.from}&to=${range.to}`, {
        token,
      }),
    retry: false,
    staleTime: 60_000,
  });
}
