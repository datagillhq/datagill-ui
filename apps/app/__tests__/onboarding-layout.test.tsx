import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mockReplace = vi.fn();
let mockPathname = "/onboarding/step-1";
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ replace: mockReplace }),
}));
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));
vi.mock("@datagill/auth/client", () => ({
  authClient: {
    organization: { list: vi.fn().mockResolvedValue({ data: [] }) },
  },
}));

import OnboardingLayout from "@/app/(app)/onboarding/layout";
import { authClient } from "@datagill/auth/client";

describe("OnboardingLayout sidebar", () => {
  it("redirects to dashboard if user already has an org", async () => {
    vi.mocked(authClient.organization.list).mockResolvedValueOnce({
      data: [{ id: "org-1" }],
    } as never);
    render(
      <OnboardingLayout>
        <div />
      </OnboardingLayout>
    );
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/dashboard"));
  });

  it("highlights the active step", () => {
    mockPathname = "/onboarding/step-1";
    render(
      <OnboardingLayout>
        <div />
      </OnboardingLayout>
    );
    const org = screen.getByText("Organization").closest("div");
    expect(org?.className).toContain("text-indigo-400");
  });

  it("renders all 4 steps", () => {
    render(
      <OnboardingLayout>
        <div />
      </OnboardingLayout>
    );
    expect(screen.getByText("Organization")).toBeInTheDocument();
    expect(screen.getByText("Integrations")).toBeInTheDocument();
    expect(screen.getByText("Team Members")).toBeInTheDocument();
    expect(screen.getByText("Billing")).toBeInTheDocument();
    expect(screen.queryByText("Verification")).not.toBeInTheDocument();
  });

  it("dims past steps", () => {
    mockPathname = "/onboarding/step-2";
    render(
      <OnboardingLayout>
        <div />
      </OnboardingLayout>
    );
    const org = screen.getByText("Organization").closest("div");
    expect(org?.className).toContain("text-muted-foreground/40");
  });
});
