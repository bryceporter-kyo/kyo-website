"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Lock, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUserRolesByEmail } from "@/lib/users";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

const resetSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

interface AuthFormProps {
    redirectUrl?: string;
    title?: string;
    description?: string;
}

export default function AuthForm({ redirectUrl = "/admin", title = "Admin Access", description = "Sign in or activate your account to access the dashboard" }: AuthFormProps) {
  const { toast } = useToast();
  const { signIn, signUp, resetPassword, loading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsSubmitting(true);
    const result = await signIn(values.email, values.password);
    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      // If redirectUrl is empty, we might just want to stay on the page (e.g. if used in a modal or inline)
      // But for now, let's assume we always redirect or reload
      if (redirectUrl) {
          router.push(redirectUrl);
      }
    } else {
      toast({
        title: "Sign in failed",
        description: getAuthErrorMessage(result.error || "Unknown error"),
        variant: "destructive",
      });
    }
  }

  async function onRegisterSubmit(values: z.infer<typeof loginSchema>) {
    setIsSubmitting(true);

    // 1. Check if the email is authorized in our system
    try {
      const roles = await getUserRolesByEmail(values.email);
      if (roles.length === 0) {
        setIsSubmitting(false);
        toast({
          title: "Access Denied",
          description: "This email has not been granted access. Please contact an administrator to be added to the user list.",
          variant: "destructive",
        });
        return;
      }
    } catch (error) {
      console.error("Error checking user roles:", error);
      setIsSubmitting(false);
      toast({
        title: "System Error",
        description: "Could not verify permissions. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    // 2. If authorized, create the Firebase Auth account
    const result = await signUp(values.email, values.password);
    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: "Account Activated!",
        description: "You have successfully set up your password and signed in.",
      });
      if (redirectUrl) {
        router.push(redirectUrl);
      }
    } else {
      // Handle "email-already-in-use" specifically
      if (result.error && result.error.includes("email-already-in-use")) {
         toast({
          title: "Account Exists",
          description: "This email is already registered. Please use the Login tab.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration failed",
          description: result.error || "Unknown error",
          variant: "destructive",
        });
      }
    }
  }

  async function handleResetPassword() {
    const validation = resetSchema.safeParse({ email: resetEmail });
    if (!validation.success) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsResetting(true);
    const result = await resetPassword(resetEmail);
    setIsResetting(false);

    if (result.success) {
      toast({
        title: "Reset email sent",
        description: "Check your inbox for password reset instructions.",
      });
      setResetDialogOpen(false);
      setResetEmail("");
    } else {
      toast({
        title: "Reset failed",
        description: getAuthErrorMessage(result.error || "Unknown error"),
        variant: "destructive",
      });
    }
  }

  return (
      <Card className="w-full max-w-md mx-auto">
        <Tabs defaultValue="login" className="w-full">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-headline">{title}</CardTitle>
            <CardDescription>
              {description}
            </CardDescription>
            <TabsList className="grid w-full grid-cols-2 mt-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">First Time Login</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent>
            <TabsContent value="login">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              placeholder="admin@example.com"
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
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
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
                    disabled={isSubmitting || loading}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-md text-sm mb-4">
                    <strong>First Time Setup:</strong> Enter the email address you provided to the administrator. You will set your password here.
                  </div>
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              placeholder="admin@example.com"
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
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
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
                    disabled={isSubmitting || loading}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Activating Account...
                      </>
                    ) : (
                      "Activate Account"
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </CardContent>
        </Tabs>
        <CardFooter className="flex justify-center">
          <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="link" className="text-sm text-muted-foreground">
                Forgot your password?
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reset Password</DialogTitle>
                <DialogDescription>
                  Enter your email address and we&apos;ll send you a link to
                  reset your password.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="admin@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleResetPassword}
                  disabled={isResetting || !resetEmail}
                >
                  {isResetting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
  );
}

// Helper function to convert Firebase error codes to user-friendly messages
function getAuthErrorMessage(error: string): string {
  if (error.includes("user-not-found")) {
    return "No account found with this email address.";
  }
  if (error.includes("wrong-password")) {
    return "Incorrect password. Please try again.";
  }
  if (error.includes("invalid-credential")) {
    return "Invalid email or password. Please try again.";
  }
  if (error.includes("too-many-requests")) {
    return "Too many failed attempts. Please try again later.";
  }
  if (error.includes("user-disabled")) {
    return "This account has been disabled.";
  }
  if (error.includes("network-request-failed")) {
    return "Network error. Please check your connection.";
  }
  return "An error occurred. Please try again.";
}
