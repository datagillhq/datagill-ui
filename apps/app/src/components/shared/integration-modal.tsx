"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, apiFetch } from "@/lib/api";
import type { Provider } from "@/lib/providers";
import { ArrowRight, Check, Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export type Integration = {
  key: string;
  source: string;
  state: string;
};

type Props = {
  open: boolean;
  mode: "create" | "edit";
  provider: Provider;
  existingIntegrationId?: string;
  onSuccess: (integration: Integration) => void;
  onCancel: () => void;
  token: string | null;
};

type Status = "idle" | "saving" | "success" | "error";

export function IntegrationModal({
  open,
  mode,
  provider,
  existingIntegrationId,
  onSuccess,
  onCancel,
  token,
}: Props) {
  const [apiKey, setApiKey] = useState("");
  const [keyTouched, setKeyTouched] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedIntegration, setSavedIntegration] = useState<Integration | null>(null);

  const isEdit = mode === "edit";
  const isSuccess = status === "success";
  const isSaving = status === "saving";

  const displayValue = isEdit && !keyTouched ? "••••••••••••••••" : apiKey;

  function handleKeyChange(value: string) {
    if (isSuccess) return;
    if (!keyTouched) setKeyTouched(true);
    setApiKey(value);
    if (status === "error") setErrorMsg(null);
  }

  async function handleSave() {
    if (isEdit && !keyTouched) {
      onCancel();
      return;
    }
    if (isSaving || isSuccess) return;
    setStatus("saving");
    setErrorMsg(null);

    try {
      let result: Integration | undefined;
      if (isEdit && existingIntegrationId) {
        result = await apiFetch<Integration>(`/v1/integrations/${existingIntegrationId}`, {
          method: "PUT",
          body: JSON.stringify({ api_key: apiKey }),
          token,
        });
      } else {
        result = await apiFetch<Integration>("/v1/integrations", {
          method: "POST",
          body: JSON.stringify({ source: provider.id, api_key: apiKey }),
          token,
        });
      }
      if (result) {
        setSavedIntegration(result);
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg("Something went wrong. Please try again.");
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again."
      );
    }
  }

  function handleContinue() {
    if (savedIntegration) onSuccess(savedIntegration);
  }

  const canSave =
    !isSaving && !isSuccess && (isEdit ? !keyTouched || apiKey.length > 0 : apiKey.length > 0);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent showCloseButton className="sm:max-w-2xl p-0 overflow-hidden">
        <div className="flex min-h-[420px]">
          {/* Left panel — connection form */}
          <div className="flex flex-1 flex-col p-8">
            {/* Provider badge */}
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-card border border-border">
                <Image
                  src={provider.logo}
                  alt={provider.name}
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold text-foreground">
                  {isEdit ? `Edit ${provider.name}` : `Connect ${provider.name}`}
                </DialogTitle>
                <p className="text-xs text-muted-foreground">{provider.description}</p>
              </div>
            </div>

            <div className="flex flex-1 flex-col">
              <div className="mb-6">
                <Label className="mb-2 block text-sm font-medium text-foreground">API Key</Label>
                <div className="relative">
                  <Input
                    type={showKey && keyTouched && !isSuccess ? "text" : "password"}
                    value={displayValue}
                    onChange={(e) => handleKeyChange(e.target.value)}
                    onFocus={() => {
                      if (isEdit && !keyTouched) {
                        setKeyTouched(true);
                        setApiKey("");
                      }
                    }}
                    disabled={isSuccess}
                    placeholder={isEdit ? "Enter new API key to replace" : "sk-••••••••"}
                    className={[
                      "pr-9 font-mono text-sm transition-colors",
                      isSuccess
                        ? "border-green-500 text-muted-foreground focus-visible:ring-green-500/30"
                        : status === "error"
                          ? "border-destructive focus-visible:ring-destructive/30"
                          : "",
                    ].join(" ")}
                    autoComplete="off"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isSuccess ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowKey((v) => !v)}
                        className="text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showKey ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
                {!isSuccess && (
                  <a
                    href={provider.docsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-block text-xs text-indigo-400 hover:underline"
                  >
                    Find your API key →
                  </a>
                )}
                {isSuccess && (
                  <p className="mt-1.5 text-xs text-green-500">
                    {provider.name} connected successfully
                  </p>
                )}
              </div>

              {errorMsg && <p className="mb-4 text-sm text-destructive">{errorMsg}</p>}

              <div className={`flex mt-auto ${isSuccess ? "justify-end" : ""}`}>
                {isSuccess ? (
                  <button
                    type="button"
                    onClick={handleContinue}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!canSave}
                    className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? "Validating…" : isEdit ? "Save" : "Connect"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right panel — security info */}
          <div className="w-64 shrink-0 border-l border-border bg-muted/30 p-6 flex flex-col gap-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Data Sovereignty
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                <div>
                  <p className="text-xs font-semibold text-foreground">AES-256 Encryption</p>
                  <p className="text-xs text-muted-foreground">
                    Keys are encrypted at rest and never exposed in logs.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                <div>
                  <p className="text-xs font-semibold text-foreground">Read-Only Access</p>
                  <p className="text-xs text-muted-foreground">
                    We only read flag data — we never write back to your provider.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                <div>
                  <p className="text-xs font-semibold text-foreground">SOC 2 Compliant</p>
                  <p className="text-xs text-muted-foreground">
                    DataGill is audited annually against SOC 2 Type II standards.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
