import { ArrowUpRight, Clock3, Waves } from "lucide-react";
import { demoTimelineEvents } from "@/lib/demo-session";
import { AppPageHeader } from "@/components/app-page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const activityBars = [82, 56, 91, 44, 68, 77, 61];

export function AppTimelinePage() {
  return (
    <div className="grid gap-6">
      <AppPageHeader
        eyebrow="Timeline"
        title="Investigate recent change activity across connected systems"
        description="This mock route shows the kind of first-class signed-in surface DataGill should provide: a readable timeline, quick operational summaries, and evidence that helps teams move from suspicion to action."
        primaryCta={{ href: "/app/flags", label: "Inspect flags" }}
        secondaryCta={{ href: "/app/integrations", label: "View integrations" }}
      />

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-border/70 bg-card/80 shadow-xl shadow-black/5">
          <CardHeader>
            <CardTitle>Activity pulse</CardTitle>
            <CardDescription>
              A simple mock of the kind of trend chart that could sit above the timeline.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex h-44 items-end gap-3 rounded-2xl border border-border/70 bg-background/70 p-4">
              {activityBars.map((height, index) => (
                <div key={`${height}-${index}`} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-2xl bg-primary/80"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-muted-foreground">D{index + 1}</span>
                </div>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <div className="text-sm text-muted-foreground">High-signal events</div>
                <div className="mt-2 text-2xl font-semibold">18</div>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <div className="text-sm text-muted-foreground">Human changes</div>
                <div className="mt-2 text-2xl font-semibold">11</div>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <div className="text-sm text-muted-foreground">Correlated alerts</div>
                <div className="mt-2 text-2xl font-semibold">3</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/80 shadow-xl shadow-black/5">
          <CardHeader>
            <CardTitle>Live audit trail mock</CardTitle>
            <CardDescription>
              Customers should be able to scan this and understand source, environment, actor, and event type immediately.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {demoTimelineEvents.map((event) => (
              <div
                key={`${event.time}-${event.title}`}
                className="grid gap-3 rounded-2xl border border-border/70 bg-background/70 p-4 md:grid-cols-[72px_1fr_auto]"
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock3 className="size-4" />
                  {event.time}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-sm font-medium">{event.title}</div>
                  <div className="text-xs uppercase tracking-[0.18em] text-primary/75">
                    {event.source} · {event.environment}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {event.actor}
                  </div>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  {event.type}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70 bg-card/80 shadow-xl shadow-black/5">
        <CardHeader>
          <CardTitle>Why this page matters</CardTitle>
          <CardDescription>
            Timeline is a strong candidate for the first deeply useful signed-in route.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Waves className="size-4 text-primary" />
              Root cause analysis
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Let users move from “what broke?” to “what changed?” in one screen.
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ArrowUpRight className="size-4 text-primary" />
              Cross-tool pivots
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Each event should later link back to the provider, incident, or metric source behind it.
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
            <div className="text-sm font-medium">Filter-first UX</div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              This page wants time range, environment, actor, and source filters once the real data layer arrives.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
