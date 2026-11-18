import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip Next.js internal files, static assets, and api
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Shortcut /calendar -> /programs/calendar
  if (pathname === "/calendar" || pathname === "/calendar/") {
    return NextResponse.rewrite(new URL("/programs/calendar", request.url));
  }

  // Shortcut /grants (and subpaths) -> /admin/grants
  // e.g. /grants -> /admin/grants, /grants/funders -> /admin/grants/funders
  if (pathname === "/grants" || pathname === "/grants/") {
    return NextResponse.rewrite(new URL("/admin/grants", request.url));
  }
  if (pathname.startsWith("/grants/")) {
    const subpath = pathname.slice("/grants".length); // e.g. "/funders"
    return NextResponse.rewrite(new URL(`/admin/grants${subpath}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
