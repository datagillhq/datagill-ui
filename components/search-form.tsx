"use client";

import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

export function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  return (
    <div className="search-stack">
      <div className="search-row">
        <input
          aria-label="Search query"
          className="input"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search for a flag, rollout, or experiment..."
          value={query}
        />
      </div>
      <div className="search-row">
        <Button
          disabled={isPending}
          onClick={() => {
            startTransition(() => {
              const next = new URLSearchParams(searchParams.toString());
              if (query.trim()) {
                next.set("q", query.trim());
              } else {
                next.delete("q");
              }

              const nextQuery = next.toString();
              router.push(nextQuery ? `/?${nextQuery}` : "/");
            });
          }}
          type="button"
        >
          {isPending ? "Searching..." : "Run Search"}
        </Button>
        <Button
          onClick={() => {
            setQuery("");
            startTransition(() => {
              router.push("/");
            });
          }}
          type="button"
          variant="secondary"
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
