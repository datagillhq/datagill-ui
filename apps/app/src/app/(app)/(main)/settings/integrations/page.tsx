"use client";

import { IntegrationCard } from "@/components/shared/integration-card";
import { IntegrationModal } from "@/components/shared/integration-modal";
import { useApiToken } from "@/hooks/use-api-token";
import {
  type IntegrationState,
  useIntegrations,
  useToggleIntegration,
} from "@/hooks/use-integrations";
import { startGitHubAuth } from "@/lib/github-auth";
import { PROVIDERS } from "@/lib/providers";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

type ModalState =
  | { mode: "create"; providerId: string }
  | { mode: "edit"; integrationKey: string; providerId: string }
  | null;

export default function SettingsIntegrationsPage() {
  const token = useApiToken();

  const queryClient = useQueryClient();
  const { data: integrations, isLoading, isError } = useIntegrations();
  const { mutate: toggle, isPending: isToggling } = useToggleIntegration();

  const [modal, setModal] = useState<ModalState>(null);
  const [githubStatus, setGitHubStatus] = useState<"idle" | "starting">("idle");
  const [githubError, setGitHubError] = useState<string | null>(null);

  const modalProvider = modal ? (PROVIDERS.find((p) => p.id === modal.providerId) ?? null) : null;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("provider") !== "github") return;

    if (params.get("status") === "connected") {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      window.history.replaceState(null, "", window.location.pathname);
      return;
    }

    if (params.get("status") === "error") {
      setGitHubError("GitHub connection failed. Please try again.");
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [queryClient]);

  function handleConnectSuccess() {
    queryClient.invalidateQueries({ queryKey: ["integrations"] });
    setModal(null);
  }

  async function handleGitHubConnect() {
    if (githubStatus === "starting") return;
    if (!token) {
      setGitHubError("Session token is still loading. Please try again in a moment.");
      return;
    }

    setGitHubStatus("starting");
    setGitHubError(null);
    try {
      const installURL = await startGitHubAuth(token, "/settings/integrations");
      window.location.assign(installURL);
    } catch {
      setGitHubStatus("idle");
      setGitHubError("GitHub connection failed. Please try again.");
    }
  }

  return (
    <div className="px-10 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Manage Integrations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect and configure your integrations.
        </p>
        {githubError && <p className="mt-3 text-sm text-destructive">{githubError}</p>}
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
            const integration = integrations?.find((i) => i.source === provider.id);
            return integration ? (
              <IntegrationCard
                key={provider.id}
                integration={integration}
                provider={provider}
                isToggling={isToggling}
                onToggle={(state: IntegrationState) => toggle({ key: integration.key, state })}
                onConfigure={() => {
                  if (provider.id === "github") {
                    handleGitHubConnect();
                    return;
                  }
                  setModal({
                    mode: "edit",
                    integrationKey: integration.key,
                    providerId: provider.id,
                  });
                }}
              />
            ) : (
              <IntegrationCard
                key={provider.id}
                provider={provider}
                isConnecting={provider.id === "github" && githubStatus === "starting"}
                onConnect={() => {
                  if (provider.id === "github") {
                    handleGitHubConnect();
                    return;
                  }
                  setModal({ mode: "create", providerId: provider.id });
                }}
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
          existingIntegrationId={modal.mode === "edit" ? modal.integrationKey : undefined}
          token={token}
          onSuccess={modal.mode === "create" ? handleConnectSuccess : () => setModal(null)}
          onCancel={() => setModal(null)}
        />
      )}
    </div>
  );
}
