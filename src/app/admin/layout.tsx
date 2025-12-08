"use client";

import { AuthProvider } from "@/components/providers/AuthProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  return (
    <AuthProvider>
      <ProtectedRoute>
        {!isLoginPage && <AdminHeader />}
        <div className={isLoginPage ? "" : "p-4 sm:p-6 lg:p-8"}>
          {children}
        </div>
      </ProtectedRoute>
    </AuthProvider>
  );
}
