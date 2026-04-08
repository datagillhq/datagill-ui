"use client";

import { apiFetch } from "@/lib/api";
import { useSession } from "@datagill/auth/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type ConnectedIntegration = {
  id: string;
  providerId: string;
  enabled: boolean;
  createdAt: string;
};

export function useIntegrations() {
  const { data: session } = useSession();
  const token = session?.session?.token ?? null;

  return useQuery({
    queryKey: ["integrations", token],
    enabled: !!token,
    queryFn: () => apiFetch<ConnectedIntegration[]>("/v1/integrations", { token }),
    staleTime: 30_000,
  });
}

export function useToggleIntegration() {
  const { data: session } = useSession();
  const token = session?.session?.token ?? null;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      apiFetch<ConnectedIntegration>(`/v1/integrations/${id}`, {
        token,
        method: "PATCH",
        body: { enabled },
      }),
    onMutate: async ({ id, enabled }) => {
      await queryClient.cancelQueries({ queryKey: ["integrations", token] });
      const previous = queryClient.getQueryData<ConnectedIntegration[]>(["integrations", token]);
      queryClient.setQueryData<ConnectedIntegration[]>(["integrations", token], (old) =>
        old?.map((i) => (i.id === id ? { ...i, enabled } : i))
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
