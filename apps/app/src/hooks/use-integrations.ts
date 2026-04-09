"use client";

import { apiFetch } from "@/lib/api";
import { useSession } from "@datagill/auth/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type IntegrationState = "active" | "paused" | "deleted";

export type ConnectedIntegration = {
  key: string;
  source: string;
  state: IntegrationState;
};

type ListResponse = { integrations: ConnectedIntegration[] };

export function useIntegrations() {
  const { data: session } = useSession();
  const token = session?.session?.token ?? null;

  return useQuery({
    queryKey: ["integrations", token],
    enabled: !!token,
    retry: false,
    queryFn: async () => {
      const res = await apiFetch<ListResponse>("/v1/integrations", { token });
      return res?.integrations ?? [];
    },
    staleTime: 30_000,
  });
}

export function useToggleIntegration() {
  const { data: session } = useSession();
  const token = session?.session?.token ?? null;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, state }: { key: string; state: IntegrationState }) =>
      apiFetch<ConnectedIntegration>(`/v1/integrations/${key}`, {
        token,
        method: "PUT",
        body: JSON.stringify({ state }),
      }),
    onMutate: async ({ key, state }) => {
      await queryClient.cancelQueries({ queryKey: ["integrations", token] });
      const previous = queryClient.getQueryData<ConnectedIntegration[]>(["integrations", token]);
      queryClient.setQueryData<ConnectedIntegration[]>(["integrations", token], (old) =>
        old?.map((i) => (i.key === key ? { ...i, state } : i))
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(["integrations", token], ctx.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations", token] });
    },
  });
}
