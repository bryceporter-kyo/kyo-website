/**
 * GET /api/auth/session-status
 *
 * Called by the grants subdomain on first load.
 * Verifies the cross-domain __session cookie and mints a Firebase custom token
 * so the client can call signInWithCustomToken() without re-entering credentials.
 *
 * Returns:
 *   { isAuthenticated: true,  customToken: "...", email: "..." }
 *   { isAuthenticated: false }
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("__session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ isAuthenticated: false });
    }

    const adminAuth = getAdminAuth();
    // checkRevoked: true ensures revoked or deleted tokens are rejected.
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);

    // Mint a short-lived custom token for the client SDK on grants subdomain.
    const customToken = await adminAuth.createCustomToken(decoded.uid);

    return NextResponse.json({
      isAuthenticated: true,
      customToken,
      email: decoded.email,
      uid: decoded.uid,
    });
  } catch (err: unknown) {
    // Invalid or expired cookie — not an error we need to log loudly.
    const msg = err instanceof Error ? err.message : String(err);
    if (!msg.includes("SESSION_COOKIE_EXPIRED") && !msg.includes("REVOKED_SESSION_COOKIE")) {
      console.error("[/api/auth/session-status]", err);
    }
    return NextResponse.json({ isAuthenticated: false });
  }
}
