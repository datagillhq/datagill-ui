"use client";

import { Menu } from "lucide-react";
import { AuthControls } from "@/components/auth-controls";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const navItems = [
  { href: "#product", label: "Product" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#use-cases", label: "Use Cases" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

export function MarketingNav() {
  return (
    <>
      <nav
        aria-label="Primary"
        className="hidden items-center gap-1 rounded-full border border-border/60 bg-card/60 p-1 md:flex"
      >
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground"
          >
            {item.label}
          </a>
        ))}
      </nav>
      <div className="md:hidden">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              aria-label="Open navigation menu"
              className="rounded-full border-border/70 bg-card/80 shadow-sm"
              size="icon-lg"
              type="button"
              variant="outline"
            >
              <Menu />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md border-border/70 bg-background/95 p-6 shadow-2xl shadow-black/10">
            <DialogTitle>Explore DataGill</DialogTitle>
            <DialogDescription>
              Jump to a section on the landing page or open the auth flows from here.
            </DialogDescription>
            <div className="flex flex-col gap-3">
              {navItems.map((item) => (
                <DialogClose asChild key={item.href}>
                  <a
                    href={item.href}
                    className="rounded-2xl border border-border/70 bg-card/70 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    {item.label}
                  </a>
                </DialogClose>
              ))}
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/40 p-4">
              <AuthControls showThemeToggle={false} stacked />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
