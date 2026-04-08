"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For individuals and small teams getting started.",
    features: ["Up to 2 integrations", "7-day audit log", "1 team member"],
    cta: "Continue with Free",
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$49",
    period: "per month",
    description: "For growing teams that need more power.",
    features: [
      "Unlimited integrations",
      "90-day audit log",
      "Up to 25 team members",
      "Priority support",
    ],
    cta: "Start Pro Trial",
    highlight: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large orgs with advanced security and compliance needs.",
    features: ["Everything in Pro", "SSO / SAML", "SOC 2 audit reports", "Dedicated support"],
    cta: "Contact Sales",
    highlight: false,
  },
];

export default function OnboardingStep4() {
  const router = useRouter();

  return (
    <div className="flex flex-1 flex-col px-12 py-10">
      <span className="mb-6 inline-flex w-fit items-center rounded-full bg-indigo-600/10 px-3 py-1 text-xs font-medium text-indigo-400">
        STEP 4 OF 4
      </span>

      <h1 className="mb-1 text-4xl font-bold text-foreground">Choose your plan</h1>
      <p className="mb-10 text-muted-foreground">
        You can upgrade or downgrade at any time. No credit card required for Free.
      </p>

      <div className="grid grid-cols-3 gap-5 max-w-4xl">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`flex flex-col rounded-xl border p-6 ${
              plan.highlight ? "border-indigo-500 bg-indigo-600/5" : "border-border bg-card"
            }`}
          >
            {plan.highlight && (
              <span className="mb-3 inline-flex w-fit items-center rounded-full bg-indigo-600/20 px-2.5 py-0.5 text-xs font-medium text-indigo-400">
                Most popular
              </span>
            )}
            <p className="text-base font-semibold text-foreground">{plan.name}</p>
            <div className="mt-2 mb-1 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-foreground">{plan.price}</span>
              {plan.period && (
                <span className="text-sm text-muted-foreground">/ {plan.period}</span>
              )}
            </div>
            <p className="mb-5 text-xs text-muted-foreground">{plan.description}</p>

            <ul className="mb-6 flex flex-col gap-2 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-400" />
                  {f}
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                plan.highlight
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "border border-border text-foreground hover:bg-muted"
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-8 flex justify-start">
        <button
          type="button"
          onClick={() => router.push("/onboarding/step-3")}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Previous Step
        </button>
      </div>
    </div>
  );
}
