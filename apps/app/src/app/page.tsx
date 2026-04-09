import { Activity, GitBranch, Users } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="flex items-center justify-between border-b border-border px-8 py-4">
        <span className="text-base font-bold tracking-tight text-foreground">DataGill</span>
        <div className="flex items-center gap-2">
          <Link
            href="/sign-in"
            className="rounded-lg px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex flex-col items-center px-8 pb-20 pt-24 text-center">
        <div className="mb-5 inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400">
          Feature Flag Intelligence
        </div>
        <h1 className="mb-5 max-w-2xl text-5xl font-bold leading-tight tracking-tight text-foreground">
          Know what changed.
          <br />
          Know who changed it.
        </h1>
        <p className="mb-8 max-w-lg text-lg text-muted-foreground">
          DataGill connects to your feature flag providers and surfaces a unified activity feed, so
          your team always knows what shipped and when.
        </p>
        <div className="flex items-center gap-3">
          <Link
            href="/sign-up"
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Get started free
          </Link>
          <Link
            href="/sign-in"
            className="rounded-lg border border-border px-5 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Sign in
          </Link>
        </div>
      </div>

      {/* Feature cards */}
      <div className="mx-auto grid max-w-4xl grid-cols-3 gap-5 px-8 pb-24">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600/20">
            <Activity className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="mb-1.5 font-semibold text-foreground">Activity Feed</p>
          <p className="text-sm text-muted-foreground">
            Every flag change, every actor, every environment — in one unified, searchable log.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600/20">
            <GitBranch className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="mb-1.5 font-semibold text-foreground">Multi-provider</p>
          <p className="text-sm text-muted-foreground">
            Connect LaunchDarkly, Unleash, and Flagsmith. One dashboard for all your flag providers.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600/20">
            <Users className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="mb-1.5 font-semibold text-foreground">Team Analytics</p>
          <p className="text-sm text-muted-foreground">
            See which teams are shipping, how fast, and spot rollback patterns before they repeat.
          </p>
        </div>
      </div>
    </div>
  );
}
