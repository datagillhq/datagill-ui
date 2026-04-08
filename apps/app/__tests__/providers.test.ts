import { PROVIDERS } from "@/lib/providers";
import { describe, expect, it } from "vitest";

describe("PROVIDERS catalog", () => {
  it("contains all four stubbed providers", () => {
    const ids = PROVIDERS.map((p) => p.id);
    expect(ids).toContain("launchdarkly");
    expect(ids).toContain("statsig");
    expect(ids).toContain("github");
    expect(ids).toContain("buildkite");
  });

  it("every provider has required fields", () => {
    for (const p of PROVIDERS) {
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.logo).toMatch(/^\/logos\/.+\.svg$/);
      expect(p.description).toBeTruthy();
      expect(p.docsLink).toMatch(/^https:\/\//);
      expect(Array.isArray(p.tags)).toBe(true);
    }
  });

  it("provider ids are unique", () => {
    const ids = PROVIDERS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
