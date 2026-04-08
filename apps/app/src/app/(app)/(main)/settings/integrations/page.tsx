"use client";

import { IntegrationCard } from "@/components/shared/integration-card";
import { IntegrationModal } from "@/components/shared/integration-modal";
import { useIntegrations, useToggleIntegration } from "@/hooks/use-integrations";
import { PROVIDERS } from "@/lib/providers";
import { useSession } from "@datagill/auth/client";
import { Plug } from "lucide-react";
import { useState } from "react";

export default function SettingsIntegrationsPage() {
  const { data: session } = useSession();
  const token = session?.session?.token ?? null;

  const { data: integrations, isLoading } = useIntegrations();
  const { mutate: toggle, isPending: isToggling } = useToggleIntegration();

  const [configuringId, setConfiguringId] = useState<string | null>(null);

  const configuringIntegration = integrations?.find((i) => i.id === configuringId) ?? null;
  const configuringProvider = configuringIntegration
    ? (PROVIDERS.find((p) => p.id === configuringIntegration.providerId) ?? null)
    : null;

  return (
    <div className="px-10 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Manage Integrations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect and configure your integrations.
        </p>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-52 animate-pulse rounded-xl bg-card" />
          ))}
        </div>
      ) : integrations && integrations.length > 0 ? (
        <div className="grid grid-cols-3 gap-5">
          {integrations.map((integration) => {
            const provider = PROVIDERS.find((p) => p.id === integration.providerId);
            if (!provider) return null;
            return (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                provider={provider}
                isToggling={isToggling}
                onToggle={(enabled) => toggle({ id: integration.id, enabled })}
                onConfigure={() => setConfiguringId(integration.id)}
              />
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20">
          <Plug className="mb-3 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm font-medium text-foreground">No integrations connected</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Connect your first integration during onboarding.
          </p>
        </div>
      )}

      {/* Configure modal */}
      {configuringIntegration && configuringProvider && (
        <IntegrationModal
          open={!!configuringId}
          mode="edit"
          provider={configuringProvider}
          existingIntegrationId={configuringIntegration.id}
          token={token}
          onSuccess={() => setConfiguringId(null)}
          onCancel={() => setConfiguringId(null)}
        />
      )}
    </div>
  );
}
