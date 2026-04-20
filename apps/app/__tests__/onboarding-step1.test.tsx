import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/onboarding/step-1",
}));

vi.mock("@datagill/auth/client", () => ({
  authClient: {
    organization: { create: vi.fn(), setActive: vi.fn().mockResolvedValue({}) },
  },
}));

import OnboardingStep1 from "@/app/(app)/onboarding/step-1/page";
import { authClient } from "@datagill/auth/client";

function wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>;
}

const mockCreateOrg = vi.mocked(authClient.organization.create);

describe("OnboardingStep1", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockCreateOrg.mockReset();
  });

  it("auto-generates slug from org name", async () => {
    render(<OnboardingStep1 />, { wrapper });
    await userEvent.type(screen.getByPlaceholderText("Acme Corp"), "My Cool Org");
    expect(screen.getByPlaceholderText("acme-corp")).toHaveValue("my-cool-org");
  });

  it("preserves manually edited slug when org name changes", async () => {
    render(<OnboardingStep1 />, { wrapper });
    const slugInput = screen.getByPlaceholderText("acme-corp");

    await userEvent.type(screen.getByPlaceholderText("Acme Corp"), "Acme");
    // Set slug directly via fireEvent to bypass slugify's per-keystroke stripping
    fireEvent.change(slugInput, { target: { value: "custom-slug" } });
    await userEvent.type(screen.getByPlaceholderText("Acme Corp"), " Inc");
    expect(slugInput).toHaveValue("custom-slug");
  });

  it("disables submit button when org name is empty", () => {
    render(<OnboardingStep1 />, { wrapper });
    expect(screen.getByRole("button", { name: /create & continue/i })).toBeDisabled();
  });

  it("navigates to step 2 on success", async () => {
    mockCreateOrg.mockResolvedValue({ data: { id: "org-1" }, error: null });
    render(<OnboardingStep1 />, { wrapper });
    await userEvent.type(screen.getByPlaceholderText("Acme Corp"), "Acme Corp");
    await userEvent.click(screen.getByRole("button", { name: /create & continue/i }));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/onboarding/step-2"));
  });

  it("shows error message on failure", async () => {
    mockCreateOrg.mockResolvedValue({ data: null, error: { message: "slug taken" } });
    render(<OnboardingStep1 />, { wrapper });
    await userEvent.type(screen.getByPlaceholderText("Acme Corp"), "Acme Corp");
    await userEvent.click(screen.getByRole("button", { name: /create & continue/i }));
    await waitFor(() =>
      expect(screen.getByText(/workspace url is already taken/i)).toBeInTheDocument()
    );
    expect(mockPush).not.toHaveBeenCalled();
  });
});
