import { QueryClient } from "@tanstack/react-query";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 30 seconds — avoids redundant refetches
        // when navigating between pages that share the same query.
        staleTime: 30 * 1000,
        // Retry once on failure; ApiErrors from 4xx are not retried (see below).
        retry: (failureCount, error) => {
          if (error instanceof Error && error.name === "ApiError") {
            // Client errors (bad request, not found, etc.) won't recover on retry.
            return false;
          }
          return failureCount < 1;
        },
      },
    },
  });
}
