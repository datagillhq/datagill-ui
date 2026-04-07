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

// Token getter is injected so this module stays testable without a real auth session.
// In production, pass () => session?.token ?? null from the component/hook.
export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const code: string = body?.code ?? "UNKNOWN";
    throw new ApiError(code, response.status);
  }

  // 204 No Content — return undefined cast to T
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
