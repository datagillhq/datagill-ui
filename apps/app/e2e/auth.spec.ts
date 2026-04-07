import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";

const AUTH_BASE = "http://localhost:3001/api/auth";
const CORE_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8082";

// Helper: raw BetterAuth API call that returns the parsed body + set-cookie header.
async function authPost(path: string, body: unknown, cookie?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (cookie) headers.Cookie = cookie;

  const res = await fetch(`${AUTH_BASE}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  return { status: res.status, body: json, setCookie: res.headers.get("set-cookie") ?? "" };
}

async function authGet(path: string, cookie: string) {
  const res = await fetch(`${AUTH_BASE}${path}`, {
    headers: { Cookie: cookie },
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : {} };
}

test.describe("BetterAuth → datagill-core", () => {
  test("authenticated JWT with org scoping is accepted by datagill-core", async () => {
    // --- unique credentials per run so tests don't collide ---
    const uid = randomUUID().slice(0, 8);
    const email = `e2e-${uid}@example.com`;
    const password = "E2ePassword1!";
    const orgName = `E2E Org ${uid}`;

    // 1. Sign up
    const signup = await authPost("/sign-up/email", {
      name: `E2E User ${uid}`,
      email,
      password,
    });
    expect(signup.status, `sign-up failed: ${JSON.stringify(signup.body)}`).toBe(200);
    const sessionCookie = signup.setCookie;
    expect(sessionCookie).toBeTruthy();

    // 2. Create organisation
    const createOrg = await authPost(
      "/organization/create",
      { name: orgName, slug: `e2e-${uid}` },
      sessionCookie
    );
    expect(createOrg.status, `create org failed: ${JSON.stringify(createOrg.body)}`).toBe(200);
    const orgId: string = createOrg.body.id;
    expect(orgId).toBeTruthy();

    // 3. Set active organisation (so JWT payload gets organizationId)
    const setActive = await authPost(
      "/organization/set-active",
      { organizationId: orgId },
      sessionCookie
    );
    expect(setActive.status, `set-active failed: ${JSON.stringify(setActive.body)}`).toBe(200);

    // 4. Request a JWT token
    const tokenRes = await authGet("/token", sessionCookie);
    expect(tokenRes.status, `token request failed: ${JSON.stringify(tokenRes.body)}`).toBe(200);
    const jwt: string = tokenRes.body.token;
    expect(jwt).toMatch(/^ey/); // sanity: it looks like a JWT

    // 5. Call datagill-core with the JWT — list integrations (GET /v1/integrations)
    const coreRes = await fetch(`${CORE_BASE}/v1/integrations`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });

    // 6. Not 401 means the JWT was accepted; 200 (empty list) or any non-auth error is fine
    expect(coreRes.status, `datagill-core rejected JWT (got ${coreRes.status})`).not.toBe(401);
    expect(coreRes.status).not.toBe(403);

    // Verify we got back data scoped to this org (empty array is fine for a new org)
    const coreBody = await coreRes.json();
    expect(Array.isArray(coreBody)).toBe(true);
  });
});
