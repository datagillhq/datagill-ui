import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@datagill/auth/client", () => ({
  authClient: {
    useSession: () => ({ data: { session: { token: "tok" } } }),
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

// Stub IntegrationModal — we test it separately
vi.mock("@/components/shared/integration-modal", () => ({
  IntegrationModal: ({
    provider,
    onSuccess,
    onCancel,
  }: {
    provider: { id: string; name: string };
    onSuccess: (i: { id: string; providerId: string; createdAt: string }) => void;
    onCancel: () => void;
  }) => (
    <div data-testid="modal">
      <span>{provider.name}</span>
      <button
        type="button"
        onClick={() => onSuccess({ id: "i1", providerId: provider.id, createdAt: "" })}
      >
        confirm
      </button>
      <button type="button" onClick={onCancel}>
        cancel
      </button>
    </div>
  ),
}));

import OnboardingStep2 from "@/app/(app)/onboarding/step-2/page";

describe("OnboardingStep2", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all providers", () => {
    render(<OnboardingStep2 />);
    expect(screen.getByText("LaunchDarkly")).toBeInTheDocument();
    expect(screen.getByText("Statsig")).toBeInTheDocument();
    expect(screen.getByText("GitHub")).toBeInTheDocument();
    expect(screen.getByText("Buildkite")).toBeInTheDocument();
  });

  it("filters providers by search query", () => {
    render(<OnboardingStep2 />);
    fireEvent.change(screen.getByPlaceholderText(/search integrations/i), {
      target: { value: "launch" },
    });
    expect(screen.getByText("LaunchDarkly")).toBeInTheDocument();
    expect(screen.queryByText("GitHub")).not.toBeInTheDocument();
  });

  it("filters providers by category tag", () => {
    render(<OnboardingStep2 />);
    fireEvent.click(screen.getByRole("button", { name: "DEVOPS" }));
    expect(screen.getByText("GitHub")).toBeInTheDocument();
    expect(screen.queryByText("Statsig")).not.toBeInTheDocument();
  });

  it("Continue button is disabled with no connections", () => {
    render(<OnboardingStep2 />);
    expect(screen.getByRole("button", { name: /continue to verification/i })).toBeDisabled();
  });

  it("opens modal when a provider card is clicked", () => {
    render(<OnboardingStep2 />);
    fireEvent.click(screen.getByText("LaunchDarkly"));
    expect(screen.getByTestId("modal")).toBeInTheDocument();
  });

  it("shows connected count and enables Continue after successful connection", async () => {
    render(<OnboardingStep2 />);
    fireEvent.click(screen.getByText("LaunchDarkly"));
    fireEvent.click(screen.getByRole("button", { name: "confirm" }));
    await waitFor(() => expect(screen.getByText(/1 tool/)).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /continue to verification/i })).not.toBeDisabled();
  });

  it("closes modal on cancel", () => {
    render(<OnboardingStep2 />);
    fireEvent.click(screen.getByText("LaunchDarkly"));
    fireEvent.click(screen.getByRole("button", { name: "cancel" }));
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });
});
