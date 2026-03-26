"use client";

import { GalleryVerticalEnd } from "lucide-react";
import { usePathname } from "next/navigation";
import { demoNavigation, demoSession } from "@/lib/demo-session";
import { cn } from "@/lib/utils";

export function AppShellSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full flex-col gap-6 rounded-[2rem] border border-border/60 bg-card/80 p-5 shadow-xl shadow-black/5 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-2xl border border-border/70 bg-background/80 text-sm font-semibold uppercase tracking-[0.18em]">
          DG
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold uppercase tracking-[0.24em] text-foreground/85">
            datagill
          </span>
          <span className="text-xs text-muted-foreground">
            {demoSession.organization.name}
          </span>
        </div>
      </div>

      <nav aria-label="App navigation" className="flex flex-col gap-1">
        {demoNavigation.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-2xl px-4 py-3 text-sm transition-colors",
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-background/80 hover:text-foreground",
            )}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="mt-auto rounded-2xl border border-border/70 bg-background/70 p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <GalleryVerticalEnd className="size-4 text-primary" />
          Demo authenticated shell
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          This area uses a stubbed org and user so we can shape the product experience before real auth is integrated.
        </p>
      </div>
    </aside>
  );
}
