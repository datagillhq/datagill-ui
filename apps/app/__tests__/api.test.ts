import { ApiError, apiFetch } from "@/lib/api";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  env: { NEXT_PUBLIC_API_URL: "http://localhost:8082" },
}));

function mockFetch(status: number, body: unknown) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    })
  );
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("apiFetch", () => {
  it("returns parsed JSON on 200", async () => {
    mockFetch(200, { id: "abc" });
    const result = await apiFetch("/v1/integrations");
    expect(result).toEqual({ id: "abc" });
  });

  it("attaches Authorization header when token provided", async () => {
    const spy = mockFetch(200, {});
    await apiFetch("/v1/integrations", { token: "tok_123" });
    const [, options] = spy.mock.calls[0];
    const headers = new Headers(options?.headers);
    expect(headers.get("Authorization")).toBe("Bearer tok_123");
  });

  it("omits Authorization header when token is null", async () => {
    const spy = mockFetch(200, {});
    await apiFetch("/v1/integrations", { token: null });
    const [, options] = spy.mock.calls[0];
    const headers = new Headers(options?.headers);
    expect(headers.get("Authorization")).toBeNull();
  });

  it("always sets Content-Type: application/json", async () => {
    const spy = mockFetch(200, {});
    await apiFetch("/v1/integrations");
    const [, options] = spy.mock.calls[0];
    const headers = new Headers(options?.headers);
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("returns undefined on 204 No Content", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(new Response(null, { status: 204 }));
    const result = await apiFetch("/v1/integrations/abc");
    expect(result).toBeUndefined();
  });

  it("throws ApiError with correct code and status on error response", async () => {
    mockFetch(422, { code: "INTEGRATION_INVALID_API_KEY" });
    await expect(apiFetch("/v1/integrations")).rejects.toMatchObject({
      name: "ApiError",
      code: "INTEGRATION_INVALID_API_KEY",
      status: 422,
    });
  });

  it("maps known error codes to human-readable messages", async () => {
    mockFetch(422, { code: "INTEGRATION_INVALID_API_KEY" });
    await expect(apiFetch("/v1/integrations")).rejects.toThrow(
      "Invalid API key. Please check your account settings."
    );
  });

  it("falls back to generic message for unknown error codes", async () => {
    mockFetch(500, { code: "SOME_UNKNOWN_CODE" });
    await expect(apiFetch("/v1/integrations")).rejects.toThrow(
      "Unexpected error (SOME_UNKNOWN_CODE)"
    );
  });

  it("handles non-JSON error body gracefully", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response("Internal Server Error", { status: 500 })
    );
    await expect(apiFetch("/v1/integrations")).rejects.toMatchObject({
      name: "ApiError",
      code: "UNKNOWN",
      status: 500,
    });
  });

  it("builds the correct URL from env base URL", async () => {
    const spy = mockFetch(200, {});
    await apiFetch("/v1/integrations");
    const [url] = spy.mock.calls[0];
    expect(url).toBe("http://localhost:8082/v1/integrations");
  });

  it("aborts and throws when the request exceeds timeoutMs", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementationOnce(
      (_url, options) =>
        new Promise((_resolve, reject) => {
          // Simulate the browser aborting the request when the signal fires
          options?.signal?.addEventListener("abort", () =>
            reject(new DOMException("The operation was aborted.", "AbortError"))
          );
        })
    );

    const fetchPromise = apiFetch("/v1/integrations", { timeoutMs: 5_000 });
    vi.advanceTimersByTime(5_000);
    await expect(fetchPromise).rejects.toMatchObject({ name: "AbortError" });
  });
});

describe("ApiError", () => {
  it("is an instance of Error", () => {
    const err = new ApiError("INTEGRATION_NOT_FOUND", 404);
    expect(err).toBeInstanceOf(Error);
  });

  it("exposes code and status", () => {
    const err = new ApiError("INTEGRATION_NOT_FOUND", 404);
    expect(err.code).toBe("INTEGRATION_NOT_FOUND");
    expect(err.status).toBe(404);
  });
});
