"use client";

import { useApiToken } from "@/hooks/use-api-token";
import { apiFetch } from "@/lib/api";
import { PROVIDERS, type Provider } from "@/lib/providers";
import { useQuery } from "@tanstack/react-query";

type SupportedProvider = Provider & { supported: boolean };

async function fetchSupportedProviderIds(token: string | null): Promise<string[]> {
  const ids = await apiFetch<string[]>("/v1/integrations/providers", { token });
  return ids ?? [];
}

export function useSupportedProviders() {
  const token = useApiToken();

  const { data: supportedIds = [], ...query } = useQuery({
    queryKey: ["supported-providers", token],
    queryFn: () => fetchSupportedProviderIds(token),
    staleTime: 5 * 60 * 1000, // provider list changes only on backend deploy
  });

  const providers: SupportedProvider[] = PROVIDERS.map((p) => ({
    ...p,
    supported: supportedIds.includes(p.id),
  }));

  return { providers, ...query };
}
