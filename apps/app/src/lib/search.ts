export type SearchResult = {
  id: string;
  orgId: string;
  flagKey: string;
  source: string;
  environment: string;
  title: string;
  description: string;
  score: number;
  lastEventAt: string;
};

export type SearchResponse = {
  query: string;
  orgId: string;
  count: number;
  results: SearchResult[];
};

const fallbackResults: SearchResult[] = [
  {
    id: "fallback-checkout-redesign",
    orgId: "local-dev",
    flagKey: "checkout-redesign",
    source: "launchdarkly",
    environment: "production",
    title: "Checkout redesign rollout",
    description: "Fallback UI data shown when the local search service is not running yet.",
    score: 0.96,
    lastEventAt: "2026-03-17T07:00:00Z",
  },
];

export async function fetchSearchResults(query: string): Promise<SearchResponse> {
  const baseUrl = process.env.SEARCH_API_BASE_URL ?? "http://localhost:8082";
  const url = new URL("/api/v1/search", baseUrl);
  if (query.trim()) {
    url.searchParams.set("q", query.trim());
  }
  url.searchParams.set("limit", "5");

  try {
    const response = await fetch(url, {
      headers: {
        "X-Org-Id": "local-dev",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`search service returned ${response.status}`);
    }

    return (await response.json()) as SearchResponse;
  } catch {
    return {
      query,
      orgId: "local-dev",
      count: fallbackResults.length,
      results: fallbackResults,
    };
  }
}
