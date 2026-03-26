export const demoSession = {
  user: {
    name: "Ada Lovelace",
    email: "ada@datagill.dev",
    role: "Founding Engineer",
  },
  organization: {
    name: "Northstar Labs",
    plan: "Prototype workspace",
  },
};

export const demoNavigation = [
  { href: "/app", label: "Overview" },
  { href: "/app/timeline", label: "Timeline" },
  { href: "/app/flags", label: "Flags" },
  { href: "/app/integrations", label: "Integrations" },
  { href: "/app/settings", label: "Settings" },
];

export const demoRecentChanges = [
  {
    title: "checkout-freeze toggled to partial rollout",
    meta: "LaunchDarkly · Production · 12 minutes ago",
    detail: "Manual change by Priya Shah during incident investigation.",
  },
  {
    title: "payment-retry-window updated for api-workers",
    meta: "Flagsmith · Staging · 46 minutes ago",
    detail: "Automated sync detected after deployment pipeline completed.",
  },
  {
    title: "onboarding-cta-cleanup marked stale",
    meta: "Derived insight · 2 hours ago",
    detail: "No meaningful production change in 64 days. Candidate for cleanup review.",
  },
];

export const demoTimelineEvents = [
  {
    time: "09:14",
    title: "checkout-freeze moved to 35% rollout",
    source: "LaunchDarkly",
    environment: "Production",
    actor: "Priya Shah",
    type: "Manual change",
  },
  {
    time: "08:42",
    title: "incident-guardrail linked to active response",
    source: "PagerDuty",
    environment: "Production",
    actor: "Incident workflow",
    type: "Incident correlation",
  },
  {
    time: "07:58",
    title: "payment-retry-window updated in staging",
    source: "Flagsmith",
    environment: "Staging",
    actor: "Deploy automation",
    type: "Automated change",
  },
  {
    time: "07:10",
    title: "api-degradation spike detected near flag churn",
    source: "Datadog",
    environment: "Production",
    actor: "Derived insight",
    type: "Metric correlation",
  },
];

export const demoFlags = [
  {
    name: "checkout-freeze",
    status: "Partial rollout",
    owner: "Payments",
    risk: "High",
    changes: 9,
  },
  {
    name: "new-onboarding-copy",
    status: "Fully on",
    owner: "Growth",
    risk: "Low",
    changes: 2,
  },
  {
    name: "payment-retry-window",
    status: "Testing",
    owner: "Platform",
    risk: "Medium",
    changes: 5,
  },
  {
    name: "onboarding-cta-cleanup",
    status: "Stale candidate",
    owner: "Growth",
    risk: "Needs review",
    changes: 1,
  },
];

export const demoIntegrations = [
  {
    name: "LaunchDarkly",
    state: "Connected",
    detail: "Primary feature flag audit source for production and staging.",
    freshness: "Synced 4 min ago",
  },
  {
    name: "Flagsmith",
    state: "Connected",
    detail: "Secondary feature flag source for experiment and staging workflows.",
    freshness: "Synced 12 min ago",
  },
  {
    name: "PagerDuty",
    state: "Planned",
    detail: "Incident correlation surface for response and postmortem views.",
    freshness: "Not connected",
  },
  {
    name: "Datadog",
    state: "Planned",
    detail: "Monitoring and metric correlation for flag-change investigations.",
    freshness: "Not connected",
  },
];

export const demoSettingsGroups = [
  {
    title: "Workspace defaults",
    items: ["Default environment: Production", "Timezone: America/Vancouver", "Digest cadence: Weekly"],
  },
  {
    title: "Access and roles",
    items: ["Org switching planned", "Role model in design", "Invitations not implemented yet"],
  },
  {
    title: "Data policies",
    items: ["Audit history retained", "Sync freshness displayed", "Provider credentials managed in backend"],
  },
];
