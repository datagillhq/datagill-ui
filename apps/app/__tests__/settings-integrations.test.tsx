import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/use-integrations", () => ({
  useIntegrations: vi.fn(),
  useToggleIntegration: vi.fn(),
}));

vi.mock("@/components/shared/integration-modal", () => ({
  IntegrationModal: ({ open, onCancel }: { open: boolean; onCancel: () => void }) =>
    open ? (
      <div>
        <span>IntegrationModal</span>
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

function setupHooks(integrations: hooks.ConnectedIntegration[] | undefined, loading = false) {
  vi.mocked(hooks.useIntegrations).mockReturnValue({
    data: integrations,
    isLoading: loading,
  } as ReturnType<typeof hooks.useIntegrations>);
  vi.mocked(hooks.useToggleIntegration).mockReturnValue({
    mutate: mockToggle,
    isPending: false,
  } as unknown as ReturnType<typeof hooks.useToggleIntegration>);
}

describe("SettingsIntegrationsPage", () => {
  it("shows loading skeletons while fetching", () => {
    setupHooks(undefined, true);
    const { container } = render(<SettingsIntegrationsPage />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("shows empty state when no integrations", () => {
    setupHooks([]);
    render(<SettingsIntegrationsPage />);
    expect(screen.getByText("No integrations connected")).toBeInTheDocument();
  });

  it("renders integration cards for known providers", () => {
    setupHooks([
      { id: "int-1", providerId: "launchdarkly", enabled: true, createdAt: "2026-04-01T00:00:00Z" },
    ]);
    render(<SettingsIntegrationsPage />);
    expect(screen.getByText("LaunchDarkly")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("skips cards for unknown providers", () => {
    setupHooks([
      {
        id: "int-2",
        providerId: "unknown-provider",
        enabled: true,
        createdAt: "2026-04-01T00:00:00Z",
      },
    ]);
    render(<SettingsIntegrationsPage />);
    expect(screen.queryByText("Active")).not.toBeInTheDocument();
  });

  it("calls toggle mutation when toggle is clicked", () => {
    setupHooks([
      { id: "int-1", providerId: "launchdarkly", enabled: true, createdAt: "2026-04-01T00:00:00Z" },
    ]);
    render(<SettingsIntegrationsPage />);
    fireEvent.click(screen.getByRole("switch"));
    expect(mockToggle).toHaveBeenCalledWith({ id: "int-1", enabled: false });
  });

  it("opens configure modal and closes it", () => {
    setupHooks([
      { id: "int-1", providerId: "launchdarkly", enabled: true, createdAt: "2026-04-01T00:00:00Z" },
    ]);
    render(<SettingsIntegrationsPage />);
    fireEvent.click(screen.getByRole("button", { name: "Configure" }));
    expect(screen.getByText("IntegrationModal")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByText("IntegrationModal")).not.toBeInTheDocument();
  });
});
