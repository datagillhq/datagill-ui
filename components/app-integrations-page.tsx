import { CheckCircle2, Link2, ShieldCheck, Wrench } from "lucide-react";
import { demoIntegrations } from "@/lib/demo-session";
import { AppPageHeader } from "@/components/app-page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AppIntegrationsPage() {
  return (
    <div className="grid gap-6">
      <AppPageHeader
        eyebrow="Integrations"
        title="Show customers what is connected, healthy, and still missing"
        description="This page should make setup and trust easy: what data sources are connected, when they last synced, and which high-value integrations should come next."
        primaryCta={{ href: "/app/settings", label: "Open settings" }}
        secondaryCta={{ href: "/app/timeline", label: "See timeline" }}
      />

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-border/70 bg-card/80 shadow-xl shadow-black/5">
          <CardHeader>
            <CardTitle>Integration center mock</CardTitle>
            <CardDescription>
              The product should balance setup clarity with confidence around sync health and permissions.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {demoIntegrations.map((integration) => (
              <div
                key={integration.name}
                className="grid gap-3 rounded-2xl border border-border/70 bg-background/70 p-4 lg:grid-cols-[0.8fr_0.45fr_1fr_auto]"
              >
                <div>
                  <div className="text-sm font-medium">{integration.name}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {integration.detail}
                  </div>
                </div>
                <div className="text-sm">
                  <div className="text-muted-foreground">Status</div>
                  <div className="mt-1 font-medium">{integration.state}</div>
                </div>
                <div className="text-sm">
                  <div className="text-muted-foreground">Freshness</div>
                  <div className="mt-1 font-medium">{integration.freshness}</div>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  Configure
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card className="border-border/70 bg-card/80 shadow-xl shadow-black/5">
            <CardHeader>
              <CardTitle>What this page should communicate</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CheckCircle2 className="size-4 text-primary" />
                  Setup confidence
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Customers should instantly know which sources are safe to trust.
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <ShieldCheck className="size-4 text-primary" />
                  Permission clarity
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Read-only access, scopes, and sync expectations should be easy to understand.
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Link2 className="size-4 text-primary" />
                  Roadmap visibility
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  This is also where future customer-facing tool categories can be introduced.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/80 shadow-xl shadow-black/5">
            <CardHeader>
              <CardTitle>Recommended next integration surfaces</CardTitle>
              <CardDescription>
                These are the most useful next customer-facing tools after feature flags.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {["PagerDuty for incident correlation", "Datadog for operational signals", "Snowflake for business outcome analysis"].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm"
                >
                  <Wrench className="size-4 text-primary" />
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
