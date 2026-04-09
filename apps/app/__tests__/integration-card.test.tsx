import { IntegrationCard } from "@/components/shared/integration-card";
import type { ConnectedIntegration, IntegrationState } from "@/hooks/use-integrations";
import type { Provider } from "@/lib/providers";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const provider: Provider = {
  id: "launchdarkly",
  name: "LaunchDarkly",
  logo: "/logos/launchdarkly.svg",
  description: "Feature management platform for enterprise teams.",
  docsLink: "https://app.launchdarkly.com",
  tags: ["RECOMMENDED"],
};

const integration: ConnectedIntegration = {
  key: "int-uuid-1",
  source: "launchdarkly",
  state: "active",
};

describe("IntegrationCard — connected", () => {
  function setup(
    overrides: Partial<ConnectedIntegration> = {},
    handlers: { onConfigure?: () => void; onToggle?: (v: IntegrationState) => void } = {}
  ) {
    const onConfigure = handlers.onConfigure ?? vi.fn();
    const onToggle = handlers.onToggle ?? vi.fn();
    render(
      <IntegrationCard
        integration={{ ...integration, ...overrides }}
        provider={provider}
        onConfigure={onConfigure}
        onToggle={onToggle}
      />
    );
    return { onConfigure, onToggle };
  }

  it("renders provider name and description", () => {
    setup();
    expect(screen.getByText("LaunchDarkly")).toBeInTheDocument();
    expect(
      screen.getByText("Feature management platform for enterprise teams.")
    ).toBeInTheDocument();
  });

  it("shows Active badge when state is active", () => {
    setup({ state: "active" });
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("hides Active badge when state is paused", () => {
    setup({ state: "paused" });
    expect(screen.queryByText("Active")).not.toBeInTheDocument();
  });

  it("toggle is checked when active", () => {
    setup({ state: "active" });
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });

  it("toggle is unchecked when paused", () => {
    setup({ state: "paused" });
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
  });

  it("calls onToggle with paused when toggling off", () => {
    const onToggle = vi.fn();
    setup({ state: "active" }, { onToggle });
    fireEvent.click(screen.getByRole("switch"));
    expect(onToggle).toHaveBeenCalledWith("paused");
  });

  it("calls onToggle with active when toggling on", () => {
    const onToggle = vi.fn();
    setup({ state: "paused" }, { onToggle });
    fireEvent.click(screen.getByRole("switch"));
    expect(onToggle).toHaveBeenCalledWith("active");
  });

  it("calls onConfigure when configure button is clicked", () => {
    const onConfigure = vi.fn();
    setup({}, { onConfigure });
    fireEvent.click(screen.getByRole("button", { name: "Configure" }));
    expect(onConfigure).toHaveBeenCalled();
  });

  it("disables toggle when isToggling", () => {
    render(
      <IntegrationCard
        integration={integration}
        provider={provider}
        onConfigure={vi.fn()}
        onToggle={vi.fn()}
        isToggling
      />
    );
    expect(screen.getByRole("switch")).toBeDisabled();
  });
});

describe("IntegrationCard — disconnected", () => {
  it("shows Connect button and no toggle", () => {
    const onConnect = vi.fn();
    render(<IntegrationCard provider={provider} onConnect={onConnect} />);
    expect(screen.getByRole("button", { name: "Connect" })).toBeInTheDocument();
    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
  });

  it("calls onConnect when Connect is clicked", () => {
    const onConnect = vi.fn();
    render(<IntegrationCard provider={provider} onConnect={onConnect} />);
    fireEvent.click(screen.getByRole("button", { name: "Connect" }));
    expect(onConnect).toHaveBeenCalled();
  });
});
