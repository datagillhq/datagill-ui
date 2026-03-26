import { Bell, Search } from "lucide-react";
import { demoSession } from "@/lib/demo-session";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export function AppShellTopbar() {
  return (
    <div className="flex flex-col gap-4 rounded-[2rem] border border-border/60 bg-card/75 p-5 shadow-lg shadow-black/5 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <div className="text-sm text-muted-foreground">
          {demoSession.organization.plan}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {demoSession.user.name.split(" ")[0]}</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          This is the first signed-in landing surface. It should eventually become the launch point for timeline, flags, and integrations.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline">
          <Search data-icon="inline-start" />
          Search changes
        </Button>
        <Button size="icon-lg" type="button" variant="outline">
          <Bell />
          <span className="sr-only">Notifications</span>
        </Button>
        <ThemeToggle />
      </div>
    </div>
  );
}
