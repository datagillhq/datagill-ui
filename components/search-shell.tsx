import { SearchForm } from "@/components/search-form";
import { Card, CardContent } from "@/components/ui/card";
import { fetchSearchResults } from "@/lib/search";

type SearchShellProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function formatDate(raw: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(raw));
}

export async function SearchShell({ searchParams }: SearchShellProps) {
  const resolvedParams = (await searchParams) ?? {};
  const rawQuery = resolvedParams.q;
  const query = Array.isArray(rawQuery) ? (rawQuery[0] ?? "") : (rawQuery ?? "");
  const response = await fetchSearchResults(query);

  return (
    <main className="page-shell">
      <div className="container stack">
        <section className="hero">
          <span className="eyebrow">DataGill Search UI Bootstrap</span>
          <h1 className="headline">Feature-flag search, with room to grow.</h1>
          <p className="subhead">
            This first screen is intentionally small: one search flow, one backend service, and
            enough structure to start building real product surfaces without committing too early to
            heavier frontend architecture.
          </p>
          <SearchForm />
          <div className="stats-grid">
            <div className="stat">
              <div className="stat-label">Active query</div>
              <div className="stat-value">{query || "all flags"}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Returned results</div>
              <div className="stat-value">{response.count}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Target backend</div>
              <div className="stat-value">search-service</div>
            </div>
          </div>
        </section>

        <section className="layout-grid">
          <Card>
            <CardContent>
              <h2 className="card-title">Search results</h2>
              <p className="card-copy">
                The page calls the Go search service through server-side fetches. If the backend is
                offline, the UI falls back to a single demo record so the frontend still renders
                during setup.
              </p>
              <div className="results" style={{ marginTop: 18 }}>
                {response.results.map((result) => (
                  <article className="result-card" key={result.id}>
                    <div className="result-top">
                      <div>
                        <h3 className="result-key">{result.title}</h3>
                        <div className="muted">{result.flagKey}</div>
                      </div>
                      <div className="pill">score {result.score.toFixed(2)}</div>
                    </div>
                    <p className="result-description">{result.description}</p>
                    <div className="pill-row">
                      <span className="pill">{result.source}</span>
                      <span className="pill">{result.environment}</span>
                      <span className="pill">{formatDate(result.lastEventAt)}</span>
                    </div>
                  </article>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h2 className="card-title">Bootstrap notes</h2>
              <div className="stack muted">
                <p className="card-copy">
                  Search service remains read-only and does not use Temporal.
                </p>
                <p className="card-copy">
                  UI uses the App Router and lightweight local components modeled after shadcn
                  structure so we can swap in generated components later.
                </p>
                <p className="card-copy">
                  The next backend step is replacing the in-memory repository with a
                  PostgreSQL-backed `SearchRepository` once the DB layer decision is made.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
