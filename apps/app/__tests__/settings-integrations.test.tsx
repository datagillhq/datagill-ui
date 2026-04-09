import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

vi.mock("@/hooks/use-integrations", () => ({
  useIntegrations: vi.fn(),
  useToggleIntegration: vi.fn(),
}));

vi.mock("@/components/shared/integration-modal", () => ({
  IntegrationModal: ({
    open,
    mode,
    onCancel,
  }: {
    open: boolean;
    mode: string;
    onCancel: () => void;
  }) =>
    open ? (
      <div>
        <span>IntegrationModal-{mode}</span>
        <button type="button" onClick={onCancel}>
          Close
        </button>
      </div>
    ) : null,
}));

vi.mock("@datagill/auth/client", () => ({
  useSession: () => ({ data: { session: { token: "tok" } } }),
}));

import SettingsIntegrationsPage from "@/app/(app)/(main)/settings/integrations/page";
import * as hooks from "@/hooks/use-integrations";

const mockToggle = vi.fn();

beforeEach(() => {
  mockToggle.mockClear();
});

function setupHooks(integrations: hooks.ConnectedIntegration[] | undefined, loading = false) {
  vi.mocked(hooks.useIntegrations).mockReturnValue({
    data: integrations,
    isLoading: loading,
    isError: false,
  } as ReturnType<typeof hooks.useIntegrations>);
  vi.mocked(hooks.useToggleIntegration).mockReturnValue({
    mutate: mockToggle,
    isPending: false,
  } as unknown as ReturnType<typeof hooks.useToggleIntegration>);
}

describe("SettingsIntegrationsPage", () => {
  it("shows loading skeletons while fetching", () => {
    setupHooks(undefined, true);
    const { container } = render(<SettingsIntegrationsPage />, { wrapper });
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("shows all providers even when none are connected", () => {
    setupHooks([]);
    render(<SettingsIntegrationsPage />, { wrapper });
    // All 4 providers from the catalog should appear
    expect(screen.getByText("LaunchDarkly")).toBeInTheDocument();
    expect(screen.getByText("Statsig")).toBeInTheDocument();
    expect(screen.getByText("GitHub")).toBeInTheDocument();
    expect(screen.getByText("Buildkite")).toBeInTheDocument();
    // All should have Connect buttons (none connected)
    expect(screen.getAllByRole("button", { name: "Connect" })).toHaveLength(4);
  });

  it("shows connected card with toggle for a connected provider", () => {
    setupHooks([{ key: "int-uuid-1", source: "launchdarkly", state: "active" as const }]);
    render(<SettingsIntegrationsPage />, { wrapper });
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByRole("switch")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Configure" })).toBeInTheDocument();
    // Other 3 still show Connect
    expect(screen.getAllByRole("button", { name: "Connect" })).toHaveLength(3);
  });

  it("calls toggle mutation when toggle is clicked", () => {
    setupHooks([{ key: "int-uuid-1", source: "launchdarkly", state: "active" as const }]);
    render(<SettingsIntegrationsPage />, { wrapper });
    fireEvent.click(screen.getByRole("switch"));
    expect(mockToggle).toHaveBeenCalledWith({ key: "int-uuid-1", state: "paused" });
  });

  it("opens edit modal when Configure is clicked", () => {
    setupHooks([{ key: "int-uuid-1", source: "launchdarkly", state: "active" as const }]);
    render(<SettingsIntegrationsPage />, { wrapper });
    fireEvent.click(screen.getByRole("button", { name: "Configure" }));
    expect(screen.getByText("IntegrationModal-edit")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByText("IntegrationModal-edit")).not.toBeInTheDocument();
  });

  it("opens create modal when Connect is clicked", () => {
    setupHooks([]);
    render(<SettingsIntegrationsPage />, { wrapper });
    fireEvent.click(screen.getAllByRole("button", { name: "Connect" })[0]);
    expect(screen.getByText("IntegrationModal-create")).toBeInTheDocument();
  });
});
