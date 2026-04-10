"use client";

import { useSession } from "@datagill/auth/client";
import { useQuery } from "@tanstack/react-query";

/**
 * Returns a signed JWT from BetterAuth's /api/auth/token endpoint.
 *
 * session.session.token is BetterAuth's opaque session cookie token — NOT a
 * JWT. The search service uses jwtMiddleware which validates RS256-signed JWTs.
 * This hook fetches the real JWT and caches it for just under its 15m TTL.
 */
export function useApiToken(): string | null {
  const { data: session } = useSession();

  const { data } = useQuery({
    queryKey: ["api-token", session?.session?.id],
    enabled: !!session,
    staleTime: 13 * 60 * 1000, // refresh ~2 min before the 15m JWT expiry
    queryFn: async () => {
      const res = await fetch("/api/auth/token", { credentials: "include" });
      if (!res.ok) return null;
      const body = await res.json();
      return (body?.token as string) ?? null;
    },
  });

  return data ?? null;
}
