import { auth } from "@datagill/auth/server";
import { type NextRequest, NextResponse } from "next/server";

// pg (via @datagill/auth/server) requires the Node.js runtime.
export const runtime = "nodejs";

// Routes that do NOT require authentication.
const PUBLIC_PREFIXES = ["/sign-in", "/sign-up", "/api/auth", "/.well-known"];

function isPublic(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // One DB round-trip per non-public request — acceptable for current traffic.
  // If latency becomes a concern, replace with a signed cookie check (no DB needed).
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    const signIn = new URL("/sign-in", request.url);
    signIn.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signIn);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on every path except Next.js internals and static assets.
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
