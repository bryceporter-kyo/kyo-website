"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { getUserRolesByEmail, UserRole } from "@/lib/users";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface GrantsAuthGateProps {
  children: React.ReactNode;
}

type GateState = "loading" | "allowed" | "denied";

export function GrantsAuthGate({ children }: GrantsAuthGateProps) {
  const { user, loading, isAuthenticated } = useAuthContext();
  const router = useRouter();
  const [gateState, setGateState] = useState<GateState>("loading");

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated || !user?.email) {
      // User is not logged in, redirect to login
      router.push("/admin/login?redirect=/grants");
      return;
    }

    async function checkRole() {
      try {
        const roles: UserRole[] = await getUserRolesByEmail(user!.email!).catch(() => []);
        setGateState(roles.includes("Grants Portal") ? "allowed" : "denied");
      } catch (err) {
        console.error("Failed to verify user roles:", err);
        setGateState("denied");
      }
    }

    checkRole();
  }, [loading, isAuthenticated, user, router]);

  if (loading || gateState === "loading") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Verifying Grants Portal permissions...</p>
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
            <Link href="/internal">Return to KYO Internal</Link>
          </Button>
        </div>
      </div>
    );
  }

  // gateState === "allowed"
  return <>{children}</>;
}
