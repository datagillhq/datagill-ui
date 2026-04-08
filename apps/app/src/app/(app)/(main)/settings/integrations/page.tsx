"use client";

import { IntegrationCard } from "@/components/shared/integration-card";
import { IntegrationModal } from "@/components/shared/integration-modal";
import { useIntegrations, useToggleIntegration } from "@/hooks/use-integrations";
import { PROVIDERS } from "@/lib/providers";
import { useSession } from "@datagill/auth/client";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

type ModalState =
  | { mode: "create"; providerId: string }
  | { mode: "edit"; integrationId: string; providerId: string }
  | null;

export default function SettingsIntegrationsPage() {
  const { data: session } = useSession();
  const token = session?.session?.token ?? null;

  const queryClient = useQueryClient();
  const { data: integrations, isLoading, isError } = useIntegrations();
  const { mutate: toggle, isPending: isToggling } = useToggleIntegration();

  const [modal, setModal] = useState<ModalState>(null);

  function handleConnectSuccess() {
    queryClient.invalidateQueries({ queryKey: ["integrations"] });
    setModal(null);
  }

  const modalProvider = modal ? (PROVIDERS.find((p) => p.id === modal.providerId) ?? null) : null;

  return (
    <div className="px-10 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Manage Integrations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect and configure your integrations.
        </p>
      </div>

      {/* Grid — always shows all providers */}
      {isLoading && !isError ? (
        <div className="grid grid-cols-3 gap-5">
          {PROVIDERS.map((p) => (
            <div key={p.id} className="h-52 animate-pulse rounded-xl bg-card" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {PROVIDERS.map((provider) => {
            const integration = integrations?.find((i) => i.providerId === provider.id);
            return integration ? (
              <IntegrationCard
                key={provider.id}
                integration={integration}
                provider={provider}
                isToggling={isToggling}
                onToggle={(enabled) => toggle({ id: integration.id, enabled })}
                onConfigure={() =>
                  setModal({ mode: "edit", integrationId: integration.id, providerId: provider.id })
                }
              />
            ) : (
              <IntegrationCard
                key={provider.id}
                provider={provider}
                onConnect={() => setModal({ mode: "create", providerId: provider.id })}
              />
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modal && modalProvider && (
        <IntegrationModal
          open
          mode={modal.mode}
          provider={modalProvider}
          existingIntegrationId={modal.mode === "edit" ? modal.integrationId : undefined}
          token={token}
          onSuccess={modal?.mode === "create" ? handleConnectSuccess : () => setModal(null)}
          onCancel={() => setModal(null)}
        />
      )}
    </div>
  );
}
