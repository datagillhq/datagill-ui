import { ArrowRight, Eye, Flag, GitBranch, ShieldCheck, Siren, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const productPillars = [
  {
    icon: Flag,
    title: "Trace feature flag change history",
    description:
      "Turn provider events into a readable timeline so teams can answer what changed, when it changed, and who made the decision.",
  },
  {
    icon: Siren,
    title: "Investigate incidents faster",
    description:
      "Give responders immediate context around recent production changes instead of forcing them to hop between dashboards during an outage.",
  },
  {
    icon: Eye,
    title: "Make risky patterns visible",
    description:
      "Highlight noisy flags, rollback loops, and stale cleanup candidates before they become operational drag.",
  },
];

const workflowSteps = [
  {
    step: "01",
    title: "Connect the systems teams already use",
    description:
      "Start with feature flag providers, then layer in incidents, observability, warehouse data, and source control when the product grows into those workflows.",
  },
  {
    step: "02",
    title: "Normalize everything into one timeline",
    description:
      "DataGill turns fragmented audit streams into a consistent product view that leaders and engineers can both trust.",
  },
  {
    step: "03",
    title: "Help teams act on the signal",
    description:
      "From recent changes to stale flags and launch summaries, the UI should surface what deserves attention next.",
  },
];

const useCases = [
  {
    title: "Engineering leadership",
    description:
      "Understand launch velocity, ownership patterns, and operational risk without stitching together weekly status reports by hand.",
    accent: "Velocity and visibility",
  },
  {
    title: "Incident response",
    description:
      "Find the most likely change window quickly and give responders a clean narrative of recent flag activity.",
    accent: "Fast root cause analysis",
  },
  {
    title: "Product and platform teams",
    description:
      "See which launches moved, which flags lingered, and where delivery workflows need cleanup or tighter controls.",
    accent: "Operational clarity",
  },
];

const principles = [
  "Customer trust comes from clear provenance, not overconfident dashboards.",
  "Every insight should preserve a link back to the source system.",
  "The product should help technical and non-technical stakeholders speak from the same evidence.",
];

const navigationOutcomes = [
  "From a homepage visit to a crisp product explanation in one scroll path",
  "From a production question to the right product narrative without extra clicks",
  "From curiosity to contact or sign-up without splitting attention across thin subpages",
];

export function MarketingHome() {
  return (
    <div className="flex flex-col gap-14 pb-20 pt-8 sm:gap-20 sm:pt-12">
      <section
        id="top"
        className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card/70 px-6 py-12 shadow-2xl shadow-black/5 backdrop-blur sm:px-10 sm:py-16"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/25 to-transparent" />
        <div className="absolute -top-28 right-0 size-64 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -bottom-24 left-0 size-64 rounded-full bg-amber-400/10 blur-3xl dark:bg-cyan-300/8" />
        <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="flex flex-col gap-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-background/70 px-4 py-1.5 text-sm text-muted-foreground">
              <Sparkles className="size-4 text-primary" />
              Business intelligence for engineering teams
            </div>
            <div className="flex flex-col gap-4">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                Understand what changed in production before the guessing starts.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                DataGill connects feature flag change history to the systems around it so engineering teams can investigate faster, communicate with more confidence, and stop losing the story across disconnected tools.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <a href="#product">
                  Explore the product
                  <ArrowRight data-icon="inline-end" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#contact">Talk to us</a>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <a href="/app">View demo app</a>
              </Button>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="rounded-full border border-border/60 bg-background/70 px-3 py-1">
                MVP: feature flag providers
              </span>
              <span className="rounded-full border border-border/60 bg-background/70 px-3 py-1">
                Root cause analysis first
              </span>
              <span className="rounded-full border border-border/60 bg-background/70 px-3 py-1">
                Built for engineering orgs
              </span>
            </div>
          </div>
          <Card className="border-border/70 bg-background/80 shadow-xl shadow-black/5">
            <CardHeader>
              <CardTitle className="text-lg">What teams need in the moment</CardTitle>
              <CardDescription>
                The landing page should make the product promise obvious before users ever reach the signed-in app.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="rounded-2xl border border-border/70 bg-muted/50 p-4">
                <div className="text-sm font-medium">Recent changes in production</div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Give responders a clean path from “something broke” to “these are the most relevant changes.”
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-muted/50 p-4">
                <div className="text-sm font-medium">Per-flag accountability</div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Show who changed a flag, what environment changed, and whether the behavior looks risky or routine.
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-muted/50 p-4">
                <div className="text-sm font-medium">Executive clarity without spreadsheets</div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Surface launch pace, cleanup opportunities, and the story behind engineering activity in one place.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="product" className="scroll-mt-28">
        <div className="mb-8 flex max-w-2xl flex-col gap-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">
            Product
          </p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            The product starts by making feature flag activity legible.
          </h2>
          <p className="text-base leading-8 text-muted-foreground">
            DataGill should make change history feel precise, searchable, and useful in real operating moments, not only during postmortems.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {productPillars.map(({ icon: Icon, title, description }) => (
            <Card
              key={title}
              className="border-border/70 bg-card/75 shadow-lg shadow-black/5 backdrop-blur"
            >
              <CardHeader className="gap-4">
                <div className="flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-background/80 text-primary">
                  <Icon className="size-5" />
                </div>
                <CardTitle className="text-xl">{title}</CardTitle>
                <CardDescription className="leading-7">{description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-28">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">
              How It Works
            </p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              One page can still feel structured, fast, and decision-oriented.
            </h2>
            <p className="text-base leading-8 text-muted-foreground">
              The public site should explain what DataGill ingests, how it turns fragmented events into a usable product surface, and why that matters to customers without forcing them through thin subpages.
            </p>
          </div>
          <div className="grid gap-4">
            {workflowSteps.map(({ step, title, description }) => (
              <Card
                key={step}
                className="border-border/70 bg-background/70 shadow-lg shadow-black/5"
              >
                <CardContent className="grid gap-4 px-6 py-6 sm:grid-cols-[auto_1fr] sm:items-start">
                  <div className="text-sm font-semibold tracking-[0.24em] text-primary/70">
                    {step}
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-medium">{title}</h3>
                    <p className="text-sm leading-7 text-muted-foreground">{description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="use-cases" className="scroll-mt-28">
        <div className="mb-8 flex max-w-2xl flex-col gap-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">
            Use Cases
          </p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            One product, different angles of value.
          </h2>
          <p className="text-base leading-8 text-muted-foreground">
            The same underlying timeline should help engineering leaders, responders, and product teams answer very different questions without fragmenting the UI.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {useCases.map(({ title, description, accent }) => (
            <Card
              key={title}
              className="border-border/70 bg-card/75 shadow-lg shadow-black/5 backdrop-blur"
            >
              <CardHeader className="gap-4">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-primary/75">
                  {accent}
                </div>
                <CardTitle className="text-xl">{title}</CardTitle>
                <CardDescription className="leading-7">{description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="scroll-mt-28">
        <div className="grid gap-6 rounded-[2rem] border border-border/60 bg-card/65 p-6 shadow-xl shadow-black/5 backdrop-blur sm:p-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">
              Why This Format
            </p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              The landing page should guide the conversation, not fragment it.
            </h2>
            <p className="text-base leading-8 text-muted-foreground">
              For this stage of the product, a scroll-based marketing site is the fastest way to explain the product clearly while keeping the visual system cohesive across light and dark mode.
            </p>
          </div>
          <div className="grid gap-3">
            {navigationOutcomes.map((outcome) => (
              <div
                key={outcome}
                className="rounded-2xl border border-border/70 bg-background/80 px-4 py-4 text-sm leading-7 text-muted-foreground"
              >
                {outcome}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="scroll-mt-28">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-start">
          <Card className="border-border/70 bg-card/70 shadow-xl shadow-black/5">
            <CardHeader>
              <CardTitle className="text-3xl tracking-tight sm:text-4xl">
                About DataGill
              </CardTitle>
              <CardDescription className="max-w-2xl text-base leading-8">
                DataGill exists because engineering organizations already have the raw signals they need, but those signals live in too many systems to be useful in the moment.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-sm leading-7 text-muted-foreground">
              <p>
                The frontend should reflect that reality: clear provenance, careful language, and interfaces that help people make decisions rather than admire dashboards.
              </p>
              <p>
                Today the story begins with feature flag activity. Over time it expands into incident response, engineering velocity, and business impact without losing the trust that comes from well-grounded evidence.
              </p>
            </CardContent>
          </Card>
          <div className="grid gap-4">
            {principles.map((principle) => (
              <Card
                key={principle}
                className="border-border/70 bg-background/75 shadow-lg shadow-black/5"
              >
                <CardContent className="flex items-start gap-4 px-6 py-5">
                  <div className="flex size-10 items-center justify-center rounded-2xl border border-border/70 bg-muted/50 text-primary">
                    <ShieldCheck className="size-5" />
                  </div>
                  <p className="text-sm leading-7 text-muted-foreground">{principle}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="scroll-mt-28">
        <Card className="overflow-hidden border-border/70 bg-card/80 shadow-2xl shadow-black/5">
          <CardContent className="grid gap-8 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="flex max-w-2xl flex-col gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">
                Contact
              </p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Want to shape the product with us?
              </h2>
              <p className="text-base leading-8 text-muted-foreground">
                If your team lives in feature flags, incidents, and engineering delivery data, we would love to hear how you investigate change today and what context still feels missing when production gets noisy.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Button asChild size="lg">
                <a href="mailto:hello@datagill.com">Contact the team</a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#top">
                  Back to top
                  <ArrowRight data-icon="inline-end" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <footer className="flex flex-col gap-3 border-t border-border/60 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="size-4" />
          Built around change history, operational clarity, and product trust.
        </div>
        <div>DataGill marketing surface v1</div>
      </footer>
    </div>
  );
}
