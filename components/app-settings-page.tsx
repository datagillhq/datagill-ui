import { Building2, LockKeyhole, Settings2, Users } from "lucide-react";
import { demoSettingsGroups, demoSession } from "@/lib/demo-session";
import { AppPageHeader } from "@/components/app-page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AppSettingsPage() {
  return (
    <div className="grid gap-6">
      <AppPageHeader
        eyebrow="Settings"
        title="Plan for org, user, and policy controls before auth is wired"
        description="Even as a mock, this route helps define what real account and workspace management should look like once Better Auth and multi-user collaboration are integrated."
        primaryCta={{ href: "/app/integrations", label: "Manage integrations" }}
        secondaryCta={{ href: "/app", label: "Back to overview" }}
      />

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-border/70 bg-card/80 shadow-xl shadow-black/5">
          <CardHeader>
            <CardTitle>Account and org snapshot</CardTitle>
            <CardDescription>
              A likely home for user, org, and access context once auth exists.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="size-4" />
                Organization
              </div>
              <div className="mt-2 text-lg font-medium">{demoSession.organization.name}</div>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="size-4" />
                Member role
              </div>
              <div className="mt-2 text-lg font-medium">{demoSession.user.role}</div>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <LockKeyhole className="size-4" />
                Auth direction
              </div>
              <div className="mt-2 text-lg font-medium">Better Auth under consideration</div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {demoSettingsGroups.map((group) => (
            <Card key={group.title} className="border-border/70 bg-card/80 shadow-xl shadow-black/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="size-4 text-primary" />
                  {group.title}
                </CardTitle>
                <CardDescription>
                  Mock content to define the settings information architecture before real backend settings arrive.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {group.items.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm text-muted-foreground"
                  >
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
