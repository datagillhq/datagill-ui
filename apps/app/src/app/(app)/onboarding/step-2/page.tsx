"use client";

import { type Integration, IntegrationModal } from "@/components/shared/integration-modal";
import { useApiToken } from "@/hooks/use-api-token";
import { PROVIDERS, type Provider } from "@/lib/providers";
import { ArrowRight, Check, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type ConnectedMap = Record<string, Integration>;

export default function OnboardingStep2() {
  const router = useRouter();
  const token = useApiToken();

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [connected, setConnected] = useState<ConnectedMap>({});
  const [modalProvider, setModalProvider] = useState<Provider | null>(null);

  const allTags = useMemo(() => Array.from(new Set(PROVIDERS.flatMap((p) => p.tags))).sort(), []);

  const filtered = useMemo(() => {
    return PROVIDERS.filter((p) => {
      const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = !activeCategory || p.tags.includes(activeCategory);
      return matchesQuery && matchesCategory;
    });
  }, [query, activeCategory]);

  const connectedCount = Object.keys(connected).length;

  function handleConnect(provider: Provider) {
    setModalProvider(provider);
  }

  function handleSuccess(integration: Integration) {
    setConnected((prev) => ({ ...prev, [integration.source]: integration }));
    setModalProvider(null);
  }

  return (
    <>
      <div className="flex flex-1 flex-col px-12 py-10">
        {/* Back link */}
        <Link
          href="/onboarding/step-1"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to step 1
        </Link>

        <h1 className="mb-1 text-4xl font-bold text-foreground">Connect your first tool</h1>
        <p className="mb-8 max-w-2xl text-muted-foreground">
          Select at least one integration to continue. These tools will allow DataGill to sync and
          verify your organization's workflow data.
        </p>

        {/* Search + Categories */}
        <div className="mb-6 flex gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search integrations (e.g. LaunchDarkly, GitHub...)"
              className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                !activeCategory
                  ? "border-indigo-500 bg-indigo-600/10 text-indigo-400"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveCategory(activeCategory === tag ? null : tag)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeCategory === tag
                    ? "border-indigo-500 bg-indigo-600/10 text-indigo-400"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Provider grid */}
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No integrations match your search.</p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((provider) => {
              const isConnected = !!connected[provider.id];
              return (
                <button
                  key={provider.id}
                  type="button"
                  onClick={() => handleConnect(provider)}
                  className={`relative rounded-xl border bg-card p-5 text-left transition-colors hover:border-indigo-500/50 ${
                    isConnected ? "border-indigo-500" : "border-border"
                  }`}
                >
                  {isConnected && (
                    <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600">
                      <Check className="h-3 w-3 text-white" />
                    </span>
                  )}
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Image
                      src={provider.logo}
                      alt={provider.name}
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                  <p className="mb-1 text-sm font-semibold text-foreground">{provider.name}</p>
                  <p className="mb-3 text-xs text-muted-foreground">{provider.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {provider.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded border border-border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer bar */}
      <div className="sticky bottom-0 flex items-center justify-between border-t border-border bg-background px-12 py-4">
        <p className="text-sm text-muted-foreground">
          {connectedCount === 0 ? (
            "No tools selected"
          ) : (
            <>
              <span className="font-semibold text-foreground">{connectedCount} tool</span>
              {connectedCount !== 1 ? "s" : ""} selected for connection
            </>
          )}
        </p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push("/onboarding/step-3")}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Skip for now
          </button>
          <button
            type="button"
            disabled={connectedCount === 0}
            onClick={() => router.push("/onboarding/step-3")}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue to Verification
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Integration modal */}
      {modalProvider && (
        <IntegrationModal
          open={true}
          mode="create"
          provider={modalProvider}
          onSuccess={handleSuccess}
          onCancel={() => setModalProvider(null)}
          token={token}
        />
      )}
    </>
  );
}
