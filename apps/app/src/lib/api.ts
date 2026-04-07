import { env } from "@/lib/env";

// Backend error codes returned as { "code": "..." } — never plain messages.
// Map every code the backend can return so the UI never shows a raw code string.
const ERROR_MESSAGES: Record<string, string> = {
  INTEGRATION_INVALID_API_KEY: "Invalid API key. Please check your account settings.",
  INTEGRATION_PROVIDER_UNREACHABLE: "Could not reach the provider. Please try again.",
  INTEGRATION_DUPLICATE_PROVIDER: "An integration for this provider is already connected.",
  INTEGRATION_NOT_FOUND: "Integration not found.",
  ANALYTICS_UNKNOWN_METRIC: "Unknown metric.",
};

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number
  ) {
    super(ERROR_MESSAGES[code] ?? `Unexpected error (${code})`);
    this.name = "ApiError";
  }
}

// Default timeout in milliseconds. Overridable per-call via options.timeoutMs.
// Protects against the backend connection closing abruptly and leaving the
// browser hanging indefinitely.
const DEFAULT_TIMEOUT_MS = 10_000;

// Token getter is injected so this module stays testable without a real auth session.
// In production, pass the token from the BetterAuth session at the call site.
export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null; timeoutMs?: number } = {}
): Promise<T | undefined> {
  const { token, timeoutMs = DEFAULT_TIMEOUT_MS, ...fetchOptions } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const headers = new Headers(fetchOptions.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const code: string = body?.code ?? "UNKNOWN";
    throw new ApiError(code, response.status);
  }

  // 204 No Content — caller receives undefined. Use apiFetch<void> for DELETE
  // calls and discard the return value.
  if (response.status === 204) {
    return undefined;
  }

  return response.json() as Promise<T>;
}
