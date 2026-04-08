"use client";

import { authClient } from "@datagill/auth/client";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Invited = { email: string; role: string };

function initials(email: string) {
  return email.slice(0, 2).toUpperCase();
}

export default function OnboardingStep4() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [inputValue, setInputValue] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [invited, setInvited] = useState<Invited[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function addEmail(raw: string) {
    const email = raw.trim().replace(/,+$/, "");
    if (!EMAIL_RE.test(email)) return;
    if (emails.includes(email) || invited.some((i) => i.email === email)) return;
    setEmails((prev) => [...prev, email]);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addEmail(inputValue);
      setInputValue("");
    } else if (e.key === "Backspace" && inputValue === "") {
      setEmails((prev) => prev.slice(0, -1));
    }
  }

  function handleBlur() {
    if (inputValue) {
      addEmail(inputValue);
      setInputValue("");
    }
  }

  async function handleSend() {
    if (!emails.length || sending) return;
    setSending(true);
    setError(null);

    const results = await Promise.all(
      emails.map((email) =>
        authClient.organization.inviteMember({
          email,
          role: "member",
          organizationId: session?.session?.activeOrganizationId ?? "",
        })
      )
    );

    const failed = results.filter((r) => r.error).length;
    if (failed > 0) {
      setError(`${failed} invite(s) failed. Please try again.`);
    }

    const succeeded = emails.filter((_, i) => !results[i]?.error);
    setInvited((prev) => [...prev, ...succeeded.map((email) => ({ email, role: "MEMBER" }))]);
    setEmails((prev) => prev.filter((e) => !succeeded.includes(e)));
    setSending(false);
  }

  const pendingCount = invited.length;

  return (
    <div className="flex flex-1 flex-col px-12 py-10">
      <h1 className="mb-1 text-4xl font-bold text-foreground">Invite your team</h1>
      <p className="mb-8 text-muted-foreground">
        Collaboration is better together. Add your teammates to{" "}
        <span className="font-medium text-foreground">
          {session?.user?.name ?? "your organization"}
        </span>
        .
      </p>

      {/* Invite card */}
      <div className="mb-8 w-full max-w-2xl rounded-xl bg-card p-6 shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Invite by email
        </p>

        {/* Tag input */}
        <div
          className="mb-3 flex min-h-10 flex-wrap items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring/50 cursor-text"
          onClick={() => inputRef.current?.focus()}
          onKeyDown={() => inputRef.current?.focus()}
        >
          {emails.map((email) => (
            <span
              key={email}
              className="inline-flex items-center gap-1 rounded-md bg-indigo-600/10 px-2 py-0.5 text-sm text-indigo-400"
            >
              {email}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setEmails((prev) => prev.filter((e) => e !== email));
                }}
                className="hover:text-indigo-200"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            type="email"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={emails.length === 0 ? "Add email addresses..." : ""}
            className="min-w-40 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            autoComplete="off"
          />
        </div>

        <p className="mb-4 text-xs italic text-muted-foreground">
          Press enter or use commas to separate multiple emails
        </p>

        {error && <p className="mb-3 text-sm text-destructive">{error}</p>}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSend}
            disabled={emails.length === 0 || sending}
            className="rounded-lg border border-border bg-card px-5 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            {sending ? "Sending…" : "Send Invites"}
          </button>
        </div>
      </div>

      {/* Already invited */}
      {pendingCount > 0 && (
        <div className="w-full max-w-2xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Already invited</h2>
            <span className="text-sm text-muted-foreground">
              {pendingCount} member{pendingCount !== 1 ? "s" : ""} pending
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {invited.map((member) => (
              <div
                key={member.email}
                className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600/20 text-xs font-semibold text-indigo-400">
                  {initials(member.email)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{member.email}</p>
                </div>
                <span className="text-xs font-semibold tracking-wide text-muted-foreground">
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto pt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/onboarding/step-3")}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Previous Step
        </button>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push("/onboarding/step-5")}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Skip for now
          </button>
          <button
            type="button"
            onClick={() => router.push("/onboarding/step-5")}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Finish Setup <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
