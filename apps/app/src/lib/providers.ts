export type Provider = {
  id: string;
  name: string;
  logo: string; // path relative to /public
  description: string;
  docsLink: string;
  tags: string[];
};

export const PROVIDERS: Provider[] = [
  {
    id: "launchdarkly",
    name: "LaunchDarkly",
    logo: "/logos/launchdarkly.svg",
    description: "Feature management platform for enterprise teams.",
    docsLink: "https://app.launchdarkly.com/settings/authorization",
    tags: ["RECOMMENDED"],
  },
  {
    id: "statsig",
    name: "Statsig",
    logo: "/logos/statsig.svg",
    description: "Feature flags, experiments, and product analytics.",
    docsLink: "https://console.statsig.com/api_keys",
    tags: ["RECOMMENDED"],
  },
  {
    id: "github",
    name: "GitHub",
    logo: "/logos/github.svg",
    description: "Track deployments and pull request activity.",
    docsLink: "https://github.com/settings/tokens",
    tags: ["DEVOPS"],
  },
  {
    id: "buildkite",
    name: "Buildkite",
    logo: "/logos/buildkite.svg",
    description: "CI/CD pipeline runs and build metrics.",
    docsLink: "https://buildkite.com/user/api-access-tokens",
    tags: ["DEVOPS"],
  },
];
