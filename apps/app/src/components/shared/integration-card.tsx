"use client";

import type { ConnectedIntegration } from "@/hooks/use-integrations";
import type { Provider } from "@/lib/providers";
import { CheckCircle } from "lucide-react";
import Image from "next/image";

type Props = {
  integration: ConnectedIntegration;
  provider: Provider;
  onConfigure: () => void;
  onToggle: (enabled: boolean) => void;
  isToggling?: boolean;
};

export function IntegrationCard({
  integration,
  provider,
  onConfigure,
  onToggle,
  isToggling,
}: Props) {
  const { enabled } = integration;

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-5">
      {/* Top row: icon + status + toggle */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
          <Image
            src={provider.logo}
            alt={provider.name}
            width={28}
            height={28}
            className="object-contain"
          />
        </div>
        <div className="flex items-center gap-2">
          {enabled && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
              <CheckCircle className="h-3.5 w-3.5" />
              Active
            </span>
          )}
          {/* Toggle */}
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            aria-label={`${enabled ? "Disable" : "Enable"} ${provider.name}`}
            disabled={isToggling}
            onClick={() => onToggle(!enabled)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 ${
              enabled ? "bg-indigo-600" : "bg-muted-foreground/30"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                enabled ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Name + description */}
      <p className="mb-1 text-sm font-semibold text-foreground">{provider.name}</p>
      <p className="mb-5 text-xs leading-relaxed text-muted-foreground">{provider.description}</p>

      {/* Configure button */}
      <div className="mt-auto">
        <button
          type="button"
          onClick={onConfigure}
          className="w-full rounded-lg border border-border px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
        >
          Configure
        </button>
      </div>
    </div>
  );
}
