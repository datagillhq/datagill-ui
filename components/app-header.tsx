import { AuthControls } from "@/components/auth-controls";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl border border-border/70 bg-card/80 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/90">
            DG
          </div>
          <div className="text-sm font-semibold tracking-[0.24em] text-foreground/85 uppercase">
            datagill
          </div>
        </div>
        <AuthControls />
      </div>
    </header>
  );
}
