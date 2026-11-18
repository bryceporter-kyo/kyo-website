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

  // Skip Next.js internal files, static assets, and api
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 1. If accessing via main domain (thekyo.ca or localhost:3000):
  // Shortcut /calendar -> /programs/calendar
  if (!isGrantsSubdomain && (pathname === "/calendar" || pathname === "/calendar/")) {
    return NextResponse.rewrite(new URL("/programs/calendar", request.url));
  }

  // Block /admin/grants - it does not exist on the main domain
  if (!isGrantsSubdomain && pathname.startsWith("/admin/grants")) {
    return NextResponse.rewrite(new URL("/not-found", request.url));
  }

  // 2. If accessing via grants subdomain (grants.thekyo.ca or grants.localhost:3000):
  if (isGrantsSubdomain) {
    // grants.thekyo.ca/ -> Grants pipeline / homepage
    if (pathname === "/") {
      return NextResponse.rewrite(new URL("/admin/grants", request.url));
    }

    // grants.thekyo.ca/admin -> Settings & Google setup
    if (pathname === "/admin" || pathname === "/admin/" || pathname === "/admin/setup" || pathname === "/setup") {
      return NextResponse.rewrite(new URL("/admin/grants/settings", request.url));
    }

    // Allow login page through
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    // Direct routing for internal sections on grants subdomain:
    // e.g. /funders -> /admin/grants/funders, /triage -> /admin/grants/triage
    if (!pathname.startsWith("/admin/grants")) {
      return NextResponse.rewrite(new URL(`/admin/grants${pathname}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
