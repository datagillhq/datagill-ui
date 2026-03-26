import { Button } from "@/components/ui/button";

export function AppPageHeader({
  eyebrow,
  title,
  description,
  primaryCta,
  secondaryCta,
}: {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta?: { href: string; label: string };
  secondaryCta?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col gap-4 rounded-[2rem] border border-border/60 bg-card/75 p-6 shadow-lg shadow-black/5 backdrop-blur lg:flex-row lg:items-end lg:justify-between">
      <div className="flex max-w-3xl flex-col gap-2">
        <div className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">
          {eyebrow}
        </div>
        <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
        <p className="text-sm leading-7 text-muted-foreground">{description}</p>
      </div>
      {(primaryCta || secondaryCta) && (
        <div className="flex flex-wrap gap-2">
          {secondaryCta ? (
            <Button asChild variant="outline">
              <a href={secondaryCta.href}>{secondaryCta.label}</a>
            </Button>
          ) : null}
          {primaryCta ? (
            <Button asChild>
              <a href={primaryCta.href}>{primaryCta.label}</a>
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}
