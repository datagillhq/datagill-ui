import { ArrowRight, Clock3, DatabaseZap, ShieldAlert, Users } from "lucide-react";
import { demoRecentChanges, demoSession } from "@/lib/demo-session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const summaryCards = [
  {
    title: "Recent production changes",
    value: "18",
    detail: "Across LaunchDarkly and Flagsmith in the last 24 hours.",
    icon: Clock3,
  },
  {
    title: "Flags needing review",
    value: "6",
    detail: "Stale, noisy, or rollback-prone candidates surfaced for this org.",
    icon: ShieldAlert,
  },
  {
    title: "Connected systems",
    value: "2",
    detail: "Feature flag integrations active. Monitoring and incident tooling can follow next.",
    icon: DatabaseZap,
  },
  {
    title: "Active collaborators",
    value: "4",
    detail: "People who touched relevant flag activity this week.",
    icon: Users,
  },
];

export function AppShellHome() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 xl:grid-cols-4 md:grid-cols-2">
        {summaryCards.map(({ title, value, detail, icon: Icon }) => (
          <Card key={title} className="border-border/70 bg-card/75 shadow-lg shadow-black/5">
            <CardHeader className="gap-4">
              <div className="flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-background/80 text-primary">
                <Icon className="size-5" />
              </div>
              <div className="flex flex-col gap-1">
                <CardDescription>{title}</CardDescription>
                <CardTitle className="text-3xl tracking-tight">{value}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">{detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/70 bg-card/80 shadow-xl shadow-black/5">
          <CardHeader>
            <CardTitle>Recent change feed</CardTitle>
            <CardDescription>
              This should become the first useful answer after login: what changed and what deserves attention next.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {demoRecentChanges.map((change) => (
              <div
                key={change.title}
                className="rounded-2xl border border-border/70 bg-background/70 p-4"
              >
                <div className="text-sm font-medium">{change.title}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.18em] text-primary/75">
                  {change.meta}
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {change.detail}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="border-border/70 bg-card/80 shadow-xl shadow-black/5">
            <CardHeader>
              <CardTitle>Workspace status</CardTitle>
              <CardDescription>
                Sample org and user context until real auth and org switching are added.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm">
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <div className="text-muted-foreground">Organization</div>
                <div className="mt-1 font-medium">{demoSession.organization.name}</div>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <div className="text-muted-foreground">Signed-in user</div>
                <div className="mt-1 font-medium">{demoSession.user.name}</div>
                <div className="text-muted-foreground">{demoSession.user.email}</div>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <div className="text-muted-foreground">Current role</div>
                <div className="mt-1 font-medium">{demoSession.user.role}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/80 shadow-xl shadow-black/5">
            <CardHeader>
              <CardTitle>What comes next</CardTitle>
              <CardDescription>
                Suggested next product surfaces after this first shell.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {["Timeline page", "Flags list", "Integrations setup", "Settings and org controls"].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm"
                >
                  <span>{item}</span>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </div>
              ))}
              <Button asChild className="mt-2" variant="outline">
                <a href="/">Back to marketing site</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
