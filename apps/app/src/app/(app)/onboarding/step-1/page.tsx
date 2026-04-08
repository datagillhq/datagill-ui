"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@datagill/auth/client";
import { ArrowLeft, ArrowRight, Pencil, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function OnboardingStep1() {
  const router = useRouter();
  const [orgName, setOrgName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleOrgNameChange(value: string) {
    setOrgName(value);
    if (!slugEdited) setSlug(slugify(value));
  }

  function handleSlugChange(value: string) {
    setSlugEdited(true);
    setSlug(slugify(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orgName.trim()) return;
    setSaving(true);
    setError(null);
    const { error } = await authClient.organization.create({ name: orgName, slug });
    setSaving(false);
    if (error) {
      setError("This workspace URL is already taken or invalid. Please try another.");
      return;
    }
    router.push("/onboarding/step-2");
  }

  return (
    <div className="flex flex-1 flex-col px-16 py-12">
      {/* Step badge */}
      <span className="mb-6 inline-flex w-fit items-center rounded-full bg-indigo-600/10 px-3 py-1 text-xs font-medium text-indigo-400">
        STEP 1 OF 4
      </span>

      <h1 className="mb-2 text-4xl font-bold text-foreground">Create your organization</h1>
      <p className="mb-10 max-w-md text-muted-foreground">
        Set up your workspace to start managing data pipelines and team integrations across your
        enterprise infrastructure.
      </p>

      {/* Form card */}
      <form
        id="org-form"
        onSubmit={handleSubmit}
        className="mb-10 w-full max-w-xl rounded-xl bg-card p-8 shadow-sm"
      >
        <div className="mb-6">
          <Label className="mb-2 block text-sm font-medium text-foreground">
            Organization Name
          </Label>
          <div className="relative">
            <Input
              type="text"
              value={orgName}
              onChange={(e) => handleOrgNameChange(e.target.value)}
              placeholder="Acme Corp"
              className="pr-9"
              required
            />
            <Pencil className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            This will be your workspace's display name.
          </p>
        </div>

        <div className="mb-2">
          <Label className="mb-2 block text-sm font-medium text-foreground">Workspace Slug</Label>
          <div className="flex overflow-hidden rounded-md border border-border">
            <span className="flex items-center bg-muted px-3 text-sm text-muted-foreground select-none">
              datagill.com/
            </span>
            <Input
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="acme-corp"
              className="rounded-none border-0 focus-visible:ring-0"
            />
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      </form>

      {/* Actions */}
      <div className="flex w-full max-w-xl items-center justify-between">
        <Link href="/sign-in" className={buttonVariants({ variant: "ghost" })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Login
        </Link>
        <Button
          type="submit"
          form="org-form"
          disabled={!orgName.trim() || saving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {saving ? "Creating…" : "Create & Continue"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Social proof */}
      <div className="mt-16 flex w-full max-w-xl gap-6">
        <div className="flex-1 rounded-xl bg-card p-5 shadow-sm">
          <div className="mb-3 flex -space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-8 w-8 rounded-full border-2 border-card bg-indigo-900 text-xs font-medium"
              />
            ))}
          </div>
          <p className="mb-2 text-sm italic text-muted-foreground">
            "DataGill transformed how we sync our multi-cloud infrastructure in minutes."
          </p>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Sarah Chen, CTO at TechFlow
          </p>
        </div>

        <div className="flex-1 rounded-xl bg-card p-5 shadow-sm">
          <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/10">
            <Shield className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="mb-2 text-sm font-semibold text-foreground">Enterprise Security</p>
          <p className="text-xs text-muted-foreground">
            Your organization data is protected by AES-256 encryption and SOC2 compliant protocols
            from the moment you click create.
          </p>
        </div>
      </div>
    </div>
  );
}
