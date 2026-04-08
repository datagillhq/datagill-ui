import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

let mockPathname = "/onboarding/step-1";
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
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

import OnboardingLayout from "@/app/(app)/onboarding/layout";

describe("OnboardingLayout sidebar", () => {
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
