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

export function GrantsAuthGate({ children }: GrantsAuthGateProps) {
  const { user, loading, isAuthenticated } = useAuthContext();
  const router = useRouter();
  const [checkingRole, setCheckingRole] = useState(true);
  const [hasGrantsRole, setHasGrantsRole] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated || !user?.email) {
      router.push("/admin/login?redirect=/admin/grants");
      return;
    }

    getUserRolesByEmail(user.email)
      .then((roles: UserRole[]) => {
        // Any user with 'Grants Portal' flag has full access
        const allowed = roles.includes("Grants Portal");
        setHasGrantsRole(allowed);
        setCheckingRole(false);
      })
      .catch((err) => {
        console.error("[GrantsAuthGate] Failed to fetch roles:", err);
        setHasGrantsRole(false);
        setCheckingRole(false);
      });
  }, [loading, isAuthenticated, user, router]);

  if (loading || checkingRole) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Verifying Grants Portal permissions...</p>
      </div>
    );
  }

  if (!hasGrantsRole) {
    return (
      <div className="container mx-auto py-16 max-w-md text-center space-y-4">
        <div className="inline-flex p-3 rounded-full bg-red-100 text-red-600 mb-2">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-headline text-foreground">Access Restricted</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your account (<strong>{user?.email}</strong>) does not have the <strong>Grants Portal</strong> permission flag enabled.
        </p>
        <p className="text-xs text-muted-foreground">
          An administrator can grant access in the Admin Panel under <em>Users &rarr; Edit &rarr; Grants Portal</em>.
        </p>
        <div className="pt-4 flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/admin">Return to Admin</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
