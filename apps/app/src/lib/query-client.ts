import { ApiError } from "@/lib/api";
import { QueryClient } from "@tanstack/react-query";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 30 seconds — avoids redundant refetches
        // when navigating between pages that share the same query.
        staleTime: 30 * 1000,
        // Retry once on failure; ApiErrors from 4xx are not retried —
        // a bad request or invalid key won't recover on a second attempt.
        retry: (failureCount, error) => {
          if (error instanceof ApiError) {
            return false;
          }
          return failureCount < 1;
        },
      },
    },
  });
}
