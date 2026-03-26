import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

export function HomePlaceholder() {
  return (
    <Card className="w-full max-w-3xl border-border/70 bg-card/75 shadow-2xl shadow-black/5 backdrop-blur dark:bg-card/80">
      <CardContent className="flex min-h-[360px] flex-col items-center justify-center gap-6 px-8 py-16 text-center">
        <div className="inline-flex rounded-full border border-border/70 bg-muted/70 px-4 py-1 text-sm text-muted-foreground">
          Placeholder
        </div>
        <div className="space-y-3">
          <CardTitle className="text-3xl tracking-tight sm:text-4xl">
            DataGill UI foundation is ready
          </CardTitle>
          <CardDescription className="mx-auto max-w-2xl text-base leading-7">
            This center area is intentionally empty for now so we can build the real
            product surface from a clean shadcn base instead of iterating on the old
            prototype layout.
          </CardDescription>
        </div>
        <div className="grid w-full max-w-xl gap-3 text-left sm:grid-cols-2">
          <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
            <div className="text-sm font-medium">Next step</div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Replace this placeholder with the first real surface we want to ship.
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
            <div className="text-sm font-medium">Status</div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Sticky header and theme toggle are now the primary app chrome.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
