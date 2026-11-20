"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

const passwordResetSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string().min(6, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const oobCode = searchParams.get("oobCode");
  const mode = searchParams.get("mode");

  const [verifying, setVerifying] = useState(true);
  const [accountEmail, setAccountEmail] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const form = useForm<z.infer<typeof passwordResetSchema>>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    async function checkCode() {
      if (!oobCode) {
        setCodeError("Invalid or missing password reset link. Please request a new link.");
        setVerifying(false);
        return;
      }

      try {
        const email = await verifyPasswordResetCode(auth, oobCode);
        setAccountEmail(email);
        setVerifying(false);
      } catch (err: any) {
        console.error("verifyPasswordResetCode error:", err);
        let msg = "This password reset link is invalid or has expired.";
        if (err?.code === "auth/expired-action-code") {
          msg = "This password reset link has expired. Please request a new one.";
        } else if (err?.code === "auth/invalid-action-code") {
          msg = "This password reset link is invalid or has already been used.";
        } else if (err?.code === "auth/user-disabled") {
          msg = "This account has been disabled. Please contact an administrator.";
        } else if (err?.code === "auth/user-not-found") {
          msg = "No user found associated with this reset link.";
        }
        setCodeError(msg);
        setVerifying(false);
      }
    }

    checkCode();
  }, [oobCode]);

  async function onSubmit(values: z.infer<typeof passwordResetSchema>) {
    if (!oobCode) return;
    setIsSubmitting(true);

    try {
      await confirmPasswordReset(auth, oobCode, values.password);
      setResetSuccess(true);
      toast({
        title: "Password Updated",
        description: "Your password has been reset successfully. You can now log in.",
      });
    } catch (err: any) {
      console.error("confirmPasswordReset error:", err);
      let errorMsg = "Failed to reset password. Please try again.";
      if (err?.code === "auth/expired-action-code") {
        errorMsg = "Your reset session has expired. Please request a new reset email.";
      } else if (err?.code === "auth/invalid-action-code") {
        errorMsg = "This reset code is invalid or has already been used.";
      } else if (err?.code === "auth/weak-password") {
        errorMsg = "Password is too weak. Please use at least 6 characters including numbers or symbols.";
      } else if (err?.message) {
        errorMsg = err.message;
      }

      toast({
        title: "Reset Failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (verifying) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-md">
        <CardContent className="py-12 flex flex-col items-center justify-center text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">Verifying reset code...</p>
        </CardContent>
      </Card>
    );
  }

  if (codeError) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-md border-destructive/20">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <CardTitle className="text-xl font-bold">Password Reset Link Issue</CardTitle>
          <CardDescription className="text-destructive font-medium">{codeError}</CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-2 pt-2">
          <Button asChild className="w-full">
            <Link href="/admin/login">Back to Login</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (resetSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-md border-emerald-200">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <CardTitle className="text-xl font-bold">Password Reset Complete</CardTitle>
          <CardDescription>
            Your password has been successfully updated. You can now access your account with your new credentials.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-2 pt-2">
          <Button asChild className="w-full">
            <Link href="/admin/login">Log In Now</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-headline font-bold">Create New Password</CardTitle>
        <CardDescription>
          {accountEmail ? (
            <>
              Enter a new password for <strong className="text-foreground">{accountEmail}</strong>
            </>
          ) : (
            "Enter your new password below."
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                "Save New Password"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center border-t py-4">
        <Link href="/admin/login" className="text-sm text-muted-foreground hover:text-foreground">
          Cancel &amp; Return to Login
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="container mx-auto py-12 flex flex-col items-center justify-center min-h-[50vh] px-4">
      <Suspense fallback={
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
