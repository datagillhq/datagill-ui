import { IntegrationModal } from "@/components/shared/integration-modal";
import * as apiModule from "@/lib/api";
import { ApiError } from "@/lib/api"; // mocked — has ERROR_MESSAGES map
import type { Provider } from "@/lib/providers";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  env: { NEXT_PUBLIC_API_URL: "http://localhost:8082" },
}));

const ERROR_MESSAGES: Record<string, string> = {
  INTEGRATION_INVALID_API_KEY: "Invalid API key. Please check your account settings.",
  INTEGRATION_PROVIDER_UNREACHABLE: "Could not reach the provider. Please try again.",
  INTEGRATION_DUPLICATE_PROVIDER: "An integration for this provider is already connected.",
};

vi.mock("@/lib/api", () => ({
  apiFetch: vi.fn(),
  ApiError: class ApiError extends Error {
    constructor(
      public code: string,
      public status: number
    ) {
      super(ERROR_MESSAGES[code] ?? `Unexpected error (${code})`);
      this.name = "ApiError";
    }
  },
}));

// next/image stub
vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

const mockProvider: Provider = {
  id: "launchdarkly",
  name: "LaunchDarkly",
  logo: "/logos/launchdarkly.svg",
  description: "Feature management platform for enterprise teams.",
  docsLink: "https://app.launchdarkly.com/settings/authorization",
  tags: ["RECOMMENDED"],
};

const mockIntegration = { id: "int-1", providerId: "launchdarkly", createdAt: "2026-01-01" };

function renderModal(props: Partial<Parameters<typeof IntegrationModal>[0]> = {}) {
  const onSuccess = vi.fn();
  const onCancel = vi.fn();
  render(
    <IntegrationModal
      open={true}
      mode="create"
      provider={mockProvider}
      onSuccess={onSuccess}
      onCancel={onCancel}
      token="tok"
      {...props}
    />
  );
  return { onSuccess, onCancel };
}

describe("IntegrationModal", () => {
  beforeEach(() => {
    vi.mocked(apiModule.apiFetch).mockReset();
  });

  it("renders provider name and description", () => {
    renderModal();
    expect(screen.getByText("Connect LaunchDarkly")).toBeInTheDocument();
    expect(
      screen.getByText("Feature management platform for enterprise teams.")
    ).toBeInTheDocument();
  });

  it("renders security panel content", () => {
    renderModal();
    expect(screen.getByText("AES-256 Encryption")).toBeInTheDocument();
    expect(screen.getByText("Read-Only Access")).toBeInTheDocument();
    expect(screen.getByText("SOC 2 Compliant")).toBeInTheDocument();
  });

  it("save button disabled when API key is empty", () => {
    renderModal();
    expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
  });

  it("save button enabled after typing a key", () => {
    renderModal();
    fireEvent.change(screen.getByPlaceholderText(/sk-/i), { target: { value: "sdk-abc123" } });
    expect(screen.getByRole("button", { name: /save/i })).not.toBeDisabled();
  });

  it("calls POST /v1/integrations on save and shows success state", async () => {
    vi.mocked(apiModule.apiFetch).mockResolvedValue(mockIntegration);
    renderModal();
    fireEvent.change(screen.getByPlaceholderText(/sk-/i), { target: { value: "sdk-abc123" } });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    await waitFor(() =>
      expect(screen.getByText("LaunchDarkly connected successfully")).toBeInTheDocument()
    );
    expect(vi.mocked(apiModule.apiFetch)).toHaveBeenCalledWith(
      "/v1/integrations",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("calls onSuccess with integration when Continue is clicked", async () => {
    vi.mocked(apiModule.apiFetch).mockResolvedValue(mockIntegration);
    const { onSuccess } = renderModal();
    fireEvent.change(screen.getByPlaceholderText(/sk-/i), { target: { value: "sdk-abc123" } });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    await waitFor(() => screen.getByText("Continue"));
    fireEvent.click(screen.getByText("Continue"));
    expect(onSuccess).toHaveBeenCalledWith(mockIntegration);
  });

  it("shows error message on API failure", async () => {
    vi.mocked(apiModule.apiFetch).mockRejectedValue(
      new ApiError("INTEGRATION_INVALID_API_KEY", 422)
    );
    renderModal();
    fireEvent.change(screen.getByPlaceholderText(/sk-/i), { target: { value: "bad-key" } });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    await waitFor(() =>
      expect(
        screen.getByText("Invalid API key. Please check your account settings.")
      ).toBeInTheDocument()
    );
  });

  it("shows masked placeholder in edit mode", () => {
    renderModal({ mode: "edit", existingIntegrationId: "int-1" });
    expect(screen.getByText("Edit LaunchDarkly")).toBeInTheDocument();
    // The masked value is shown as display text in the input
    const input = screen.getByPlaceholderText("Enter new API key to replace");
    expect(input).toBeInTheDocument();
  });

  it("in edit mode with no changes, calls onCancel without making an API call", () => {
    const { onCancel } = renderModal({ mode: "edit", existingIntegrationId: "int-1" });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(onCancel).toHaveBeenCalled();
    expect(vi.mocked(apiModule.apiFetch)).not.toHaveBeenCalled();
  });

  it("in edit mode, sends PUT with new apiKey when key is changed", async () => {
    vi.mocked(apiModule.apiFetch).mockResolvedValue(mockIntegration);
    renderModal({ mode: "edit", existingIntegrationId: "int-1" });
    fireEvent.change(screen.getByPlaceholderText("Enter new API key to replace"), {
      target: { value: "new-key" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    await waitFor(() => expect(vi.mocked(apiModule.apiFetch)).toHaveBeenCalled());
    const call = vi.mocked(apiModule.apiFetch).mock.calls[0];
    expect(call[0]).toBe("/v1/integrations/int-1");
    expect((call[1] as { method: string }).method).toBe("PUT");
    const body = JSON.parse((call[1] as { body: string }).body);
    expect(body.apiKey).toBe("new-key");
  });
});
