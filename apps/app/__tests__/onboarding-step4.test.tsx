import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockInviteMember = vi.fn();

vi.mock("@datagill/auth/client", () => ({
  authClient: {
    useSession: () => ({
      data: {
        session: { token: "tok", activeOrganizationId: "org-1" },
        user: { name: "Acme Corp" },
      },
    }),
    organization: { inviteMember: (...args: unknown[]) => mockInviteMember(...args) },
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

import OnboardingStep3 from "@/app/(app)/onboarding/step-3/page";

describe("OnboardingStep4", () => {
  beforeEach(() => {
    mockInviteMember.mockReset();
    mockInviteMember.mockResolvedValue({ data: {}, error: null });
  });

  it("renders the invite form", () => {
    render(<OnboardingStep3 />);
    expect(screen.getByText("Invite your team")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Add email addresses...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send invites/i })).toBeDisabled();
  });

  it("adds an email tag on Enter", () => {
    render(<OnboardingStep3 />);
    const input = screen.getByPlaceholderText("Add email addresses...");
    fireEvent.change(input, { target: { value: "alice@example.com" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send invites/i })).not.toBeDisabled();
  });

  it("adds an email tag on comma", () => {
    render(<OnboardingStep3 />);
    const input = screen.getByPlaceholderText("Add email addresses...");
    fireEvent.change(input, { target: { value: "bob@example.com" } });
    fireEvent.keyDown(input, { key: "," });
    expect(screen.getByText("bob@example.com")).toBeInTheDocument();
  });

  it("ignores invalid email addresses", () => {
    render(<OnboardingStep3 />);
    const input = screen.getByPlaceholderText("Add email addresses...");
    fireEvent.change(input, { target: { value: "not-an-email" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.queryByText("not-an-email")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send invites/i })).toBeDisabled();
  });

  it("calls inviteMember and shows invited list on success", async () => {
    render(<OnboardingStep3 />);
    const input = screen.getByPlaceholderText("Add email addresses...");
    fireEvent.change(input, { target: { value: "alice@example.com" } });
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.click(screen.getByRole("button", { name: /send invites/i }));
    await waitFor(() => expect(screen.getByText("Already invited")).toBeInTheDocument());
    expect(screen.getByText("1 member pending")).toBeInTheDocument();
    expect(mockInviteMember).toHaveBeenCalledWith({
      email: "alice@example.com",
      role: "member",
      organizationId: "org-1",
    });
  });

  it("shows error count when invites fail", async () => {
    mockInviteMember.mockResolvedValue({ data: null, error: { message: "Failed" } });
    render(<OnboardingStep3 />);
    const input = screen.getByPlaceholderText("Add email addresses...");
    fireEvent.change(input, { target: { value: "alice@example.com" } });
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.click(screen.getByRole("button", { name: /send invites/i }));
    await waitFor(() => expect(screen.getByText(/1 invite\(s\) failed/i)).toBeInTheDocument());
  });
});
