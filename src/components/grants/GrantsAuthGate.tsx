"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { getUserRolesByEmail, UserRole } from "@/lib/users";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface GrantsAuthGateProps {
  children: React.ReactNode;
}

type GateState = "loading" | "sso-check" | "allowed" | "denied" | "unauthenticated";

export function GrantsAuthGate({ children }: GrantsAuthGateProps) {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const [gateState, setGateState] = useState<GateState>("loading");

  useEffect(() => {
    if (loading) return;

    async function checkAccess() {
      // ── 1. Already signed in locally via Firebase SDK ──────────────────────
      if (user?.email) {
        const roles: UserRole[] = await getUserRolesByEmail(user.email).catch(() => []);
        setGateState(roles.includes("Grants Portal") ? "allowed" : "denied");
        return;
      }

      // ── 2. No local session — try cross-domain SSO via __session cookie ────
      setGateState("sso-check");
      try {
        const res = await fetch("/api/auth/session-status");
        const data = await res.json();

        if (data.isAuthenticated && data.customToken) {
          // Sign in to the local Firebase SDK on this subdomain using the custom token.
          await signInWithCustomToken(auth, data.customToken);
          // onAuthStateChanged in AuthProvider will update `user`; re-run effect.
          return;
        }
      } catch (err) {
        console.warn("[GrantsAuthGate] SSO check failed:", err);
      }

      // ── 3. No session at all — send to login ───────────────────────────────
      setGateState("unauthenticated");
      router.push("/admin/login?redirect=/admin/grants");
    }

    checkAccess();
  }, [loading, user, router]);

  // ── Render states ──────────────────────────────────────────────────────────

  if (gateState === "loading" || gateState === "sso-check") {
    const label =
      gateState === "sso-check"
        ? "Signing you in automatically..."
        : "Verifying Grants Portal permissions...";
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    );
  }

  if (gateState === "denied") {
    return (
      <div className="container mx-auto py-16 max-w-md text-center space-y-4">
        <div className="inline-flex p-3 rounded-full bg-red-100 text-red-600 mb-2">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-headline text-foreground">Access Restricted</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your account (<strong>{user?.email}</strong>) does not have the{" "}
          <strong>Grants Portal</strong> permission flag enabled.
        </p>
        <p className="text-xs text-muted-foreground">
          An administrator can grant access in the Admin Panel under{" "}
          <em>Users → Edit → Grants Portal</em>.
        </p>
        <div className="pt-4 flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/admin">Return to Admin</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (gateState === "unauthenticated") {
    // Will redirect; show nothing.
    return null;
  }

  // gateState === "allowed"
  return <>{children}</>;
}
