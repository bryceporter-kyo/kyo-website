/**
 * POST /api/auth/session  — Exchange a Firebase ID token for a cross-domain session cookie.
 * DELETE /api/auth/session — Clear the session cookie (sign out across domains).
 *
 * Cookie: __session, Domain: .thekyo.ca (or localhost in dev), HttpOnly, Secure, SameSite=Lax
 * Lifetime: 5 days (matches Firebase session cookie max recommended duration).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";

// Cookie name must be "__session" for Firebase Hosting compatibility.
const COOKIE_NAME = "__session";
const FIVE_DAYS_MS = 60 * 60 * 24 * 5 * 1000;

/** Determine cookie domain — root domain so all subdomains share it. */
function cookieDomain(req: NextRequest): string {
  const host = req.headers.get("host") || "";
  // In production: thekyo.ca, grants.thekyo.ca → .thekyo.ca
  if (host.includes("thekyo.ca")) return ".thekyo.ca";
  // In local dev: localhost or grants.localhost:3000 → (no domain attribute = localhost only)
  return "";
}

function setCookieHeader(value: string, maxAge: number, domain: string): string {
  const parts = [
    `${COOKIE_NAME}=${value}`,
    `Max-Age=${Math.floor(maxAge / 1000)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (domain) parts.push(`Domain=${domain}`);
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

// ── POST: create session cookie ───────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    if (!idToken) {
      return NextResponse.json({ error: "idToken required" }, { status: 400 });
    }

    const adminAuth = getAdminAuth();

    // Verify the ID token is recent (issued in last 5 minutes) to prevent replay attacks.
    const decoded = await adminAuth.verifyIdToken(idToken);
    const issuedAt = decoded.iat * 1000;
    if (Date.now() - issuedAt > 5 * 60 * 1000) {
      return NextResponse.json({ error: "ID token too old" }, { status: 400 });
    }

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: FIVE_DAYS_MS,
    });

    const domain = cookieDomain(req);
    const res = NextResponse.json({ status: "ok" });
    res.headers.set("Set-Cookie", setCookieHeader(sessionCookie, FIVE_DAYS_MS, domain));
    return res;
  } catch (err) {
    console.error("[/api/auth/session POST]", err);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}

// ── DELETE: clear session cookie ──────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const domain = cookieDomain(req);
  const res = NextResponse.json({ status: "ok" });
  res.headers.set("Set-Cookie", setCookieHeader("", 0, domain));
  return res;
}
