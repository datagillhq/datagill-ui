"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CreditCard, LayoutDashboard, Plug, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const STEPS = [
  { label: "Organization", href: "/onboarding/step-1", icon: LayoutDashboard },
  { label: "Integrations", href: "/onboarding/step-2", icon: Plug },
  { label: "Verification", href: "/onboarding/step-3", icon: ShieldCheck },
  { label: "Team Members", href: "/onboarding/step-4", icon: Users },
  { label: "Billing", href: "/onboarding/step-5", icon: CreditCard },
];

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentIndex = STEPS.findIndex((s) => pathname.startsWith(s.href));

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="flex w-56 flex-col justify-between border-r border-border bg-card px-4 py-6">
        <div>
          <div className="mb-8 flex items-center gap-2 px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <LayoutDashboard className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-foreground">DataGill</p>
              <p className="text-xs text-muted-foreground">Onboarding</p>
            </div>
          </div>

          <nav className="space-y-1">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isActive = i === currentIndex;
              const isPast = i < currentIndex;
              return (
                <div
                  key={step.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm",
                    isActive
                      ? "bg-indigo-600/10 font-medium text-indigo-400"
                      : isPast
                        ? "text-muted-foreground/40"
                        : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {step.label}
                </div>
              );
            })}
          </nav>
        </div>

        <Link
          href="/dashboard"
          className={buttonVariants({ variant: "outline", className: "w-full justify-center" })}
        >
          Go to Dashboard
        </Link>
      </aside>

      {/* Main content */}
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
