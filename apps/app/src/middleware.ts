import { auth } from "@datagill/auth/server";
import { type NextRequest, NextResponse } from "next/server";

// pg (via @datagill/auth/server) requires the Node.js runtime.
export const runtime = "nodejs";

// Routes that do NOT require authentication.
const PUBLIC_PREFIXES = ["/api/auth", "/.well-known"];
const AUTH_PAGES = ["/sign-in", "/sign-up"];

function isAuthPage(pathname: string): boolean {
  return AUTH_PAGES.some((p) => pathname.startsWith(p));
}

function isPublic(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Landing page is always public — no session check.
  if (pathname === "/") return NextResponse.next();

  // API routes and well-known endpoints are always public.
  if (isPublic(pathname)) return NextResponse.next();

  // One DB round-trip per non-public request — acceptable for current traffic.
  // If latency becomes a concern, replace with a signed cookie check (no DB needed).
  const session = await auth.api.getSession({ headers: request.headers });

  // Redirect authenticated users away from sign-in / sign-up to the dashboard.
  if (session && isAuthPage(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users to sign-in (except auth pages themselves).
  if (!session && !isAuthPage(pathname)) {
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
