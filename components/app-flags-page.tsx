import { AlertTriangle, ArrowRight, BarChart3, FlagTriangleRight } from "lucide-react";
import { demoFlags } from "@/lib/demo-session";
import { AppPageHeader } from "@/components/app-page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const distribution = [
  { label: "Fully on", value: 38 },
  { label: "Partial", value: 16 },
  { label: "Testing", value: 11 },
  { label: "Needs review", value: 8 },
];

export function AppFlagsPage() {
  return (
    <div className="grid gap-6">
      <AppPageHeader
        eyebrow="Flags"
        title="Search, assess, and prioritize the flags that matter most"
        description="This route should eventually combine searchable flag inventory, lifecycle context, and risk signals so teams can understand what needs action instead of scrolling raw provider lists."
        primaryCta={{ href: "/app/timeline", label: "Open timeline" }}
        secondaryCta={{ href: "/app", label: "Back to overview" }}
      />

      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <Card className="border-border/70 bg-card/80 shadow-xl shadow-black/5">
          <CardHeader>
            <CardTitle>Flag distribution</CardTitle>
            <CardDescription>
              A mock analytics panel for status mix and cleanup priority.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {distribution.map((item) => (
              <div key={item.label} className="grid gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{item.label}</span>
                  <span className="text-muted-foreground">{item.value}</span>
                </div>
                <div className="h-3 rounded-full bg-muted/70">
                  <div
                    className="h-3 rounded-full bg-primary"
                    style={{ width: `${Math.min(item.value * 2, 100)}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <div className="text-sm text-muted-foreground">Flags launched this month</div>
                <div className="mt-2 text-2xl font-semibold">12</div>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <div className="text-sm text-muted-foreground">Cleanup candidates</div>
                <div className="mt-2 text-2xl font-semibold">6</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/80 shadow-xl shadow-black/5">
          <CardHeader>
            <CardTitle>Flag inventory mock</CardTitle>
            <CardDescription>
              A list view with just enough signal to prioritize investigation and cleanup.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {demoFlags.map((flag) => (
              <div
                key={flag.name}
                className="grid gap-3 rounded-2xl border border-border/70 bg-background/70 p-4 lg:grid-cols-[1.1fr_0.8fr_0.5fr_0.4fr_auto]"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <FlagTriangleRight className="size-4 text-primary" />
                    {flag.name}
                  </div>
                  <div className="text-sm text-muted-foreground">{flag.owner}</div>
                </div>
                <div className="text-sm">
                  <div className="text-muted-foreground">Status</div>
                  <div className="mt-1 font-medium">{flag.status}</div>
                </div>
                <div className="text-sm">
                  <div className="text-muted-foreground">Risk</div>
                  <div className="mt-1 font-medium">{flag.risk}</div>
                </div>
                <div className="text-sm">
                  <div className="text-muted-foreground">Changes</div>
                  <div className="mt-1 font-medium">{flag.changes}</div>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  View details
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/70 bg-card/80 shadow-lg shadow-black/5">
          <CardContent className="flex gap-4 px-5 py-5">
            <BarChart3 className="size-5 text-primary" />
            <div>
              <div className="text-sm font-medium">Lifecycle reporting</div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                This page likely grows into stale, dead, and launched-this-month views.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/80 shadow-lg shadow-black/5">
          <CardContent className="flex gap-4 px-5 py-5">
            <AlertTriangle className="size-5 text-primary" />
            <div>
              <div className="text-sm font-medium">Risk surfacing</div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                High-churn or rollback-prone flags should stand out visually before users click through.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/80 shadow-lg shadow-black/5">
          <CardContent className="flex gap-4 px-5 py-5">
            <ArrowRight className="size-5 text-primary" />
            <div>
              <div className="text-sm font-medium">Future detail route</div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                `/app/flags/[flagKey]` should become the detailed narrative view for a single flag.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
