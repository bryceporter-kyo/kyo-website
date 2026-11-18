import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  // Check if request is targeting the grants subdomain:
  // e.g. "grants.localhost:3000" or "grants.thekyo.ca"
  const isGrantsSubdomain = 
    hostname.startsWith("grants.") || 
    hostname.includes("grants.localhost") ||
    hostname.includes("grants.thekyo.ca");

  if (isGrantsSubdomain) {
    // Avoid double rewriting if already under /admin/grants or api/static files
    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api") ||
      pathname.includes(".")
    ) {
      return NextResponse.next();
    }

    // Rewrite root "/" on grants subdomain to "/admin/grants"
    if (pathname === "/") {
      return NextResponse.rewrite(new URL("/admin/grants", request.url));
    }

    // If accessing "/admin/setup" or "/setup" on grants subdomain, route to settings
    if (pathname === "/admin/setup" || pathname === "/setup") {
      return NextResponse.rewrite(new URL("/admin/grants/settings", request.url));
    }

    // If accessing other routes like "/funders", rewrite to "/admin/grants/funders"
    if (!pathname.startsWith("/admin/grants") && !pathname.startsWith("/admin/login")) {
      return NextResponse.rewrite(new URL(`/admin/grants${pathname}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. Static files (e.g. /favicon.ico, sitemap.xml, images)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
