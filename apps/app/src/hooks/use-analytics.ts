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

function useDates() {
  const to = new Date().toISOString().split("T")[0];
  const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  return { from, to };
}

export function useTopTeams() {
  const { data: session } = useSession();
  const token = session?.session?.token ?? null;
  const { from, to } = useDates();

  return useQuery({
    queryKey: ["top-teams", { from, to }, token],
    queryFn: () =>
      apiFetch<TeamActivity[]>(`/v1/analytics?metric=top_teams&from=${from}&to=${to}`, { token }),
    staleTime: 60_000,
  });
}

export function useLaunchedWins() {
  const { data: session } = useSession();
  const token = session?.session?.token ?? null;
  const { from, to } = useDates();

  return useQuery({
    queryKey: ["launched-wins", { from, to }, token],
    queryFn: () =>
      apiFetch<LaunchedFlag[]>(`/v1/analytics?metric=launched_wins&from=${from}&to=${to}`, {
        token,
      }),
    staleTime: 60_000,
  });
}

export function useVelocity() {
  const { data: session } = useSession();
  const token = session?.session?.token ?? null;
  const { from, to } = useDates();

  return useQuery({
    queryKey: ["velocity", { from, to }, token],
    queryFn: () =>
      apiFetch<VelocityData>(`/v1/analytics?metric=velocity&from=${from}&to=${to}`, { token }),
    staleTime: 60_000,
  });
}
