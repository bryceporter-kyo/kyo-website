"use client";

import AuthForm from "@/components/auth/AuthForm";

export default function AdminLoginPage() {
  return (
    <div className="container mx-auto py-12 flex flex-col items-center justify-center min-h-[50vh]">
      <AuthForm 
        title="Admin Access" 
        description="Sign in to manage the website."
        redirectUrl="/admin"
      />
    </div>
  );
}
