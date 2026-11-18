"use client";

import { useState, useEffect, useCallback } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export type AuthUser = User | null;

export interface AuthState {
  user: AuthUser;
  loading: boolean;
  error: string | null;
}

/**
 * Exchange the Firebase ID token for a cross-domain session cookie scoped to .thekyo.ca.
 * Fire-and-forget — the cookie is best-effort; local Firebase state is the source of truth.
 */
async function setSessionCookie(user: User): Promise<void> {
  try {
    const idToken = await user.getIdToken();
    await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
  } catch (err) {
    console.warn("[useAuth] Failed to set session cookie:", err);
  }
}

/** Remove the cross-domain session cookie. */
async function clearSessionCookie(): Promise<void> {
  try {
    await fetch("/api/auth/session", { method: "DELETE" });
  } catch (err) {
    console.warn("[useAuth] Failed to clear session cookie:", err);
  }
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setAuthState({
          user,
          loading: false,
          error: null,
        });
      },
      (error) => {
        setAuthState({
          user: null,
          loading: false,
          error: error.message,
        });
      }
    );

    return () => unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setAuthState({
        user: userCredential.user,
        loading: false,
        error: null,
      });
      // Persist auth across subdomains after first activation.
      await setSessionCookie(userCredential.user);
      return { success: true, user: userCredential.user };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Sign up failed";
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setAuthState({
        user: userCredential.user,
        loading: false,
        error: null,
      });
      // Persist auth across subdomains (grants.thekyo.ca) via a root-domain session cookie.
      await setSessionCookie(userCredential.user);
      return { success: true, user: userCredential.user };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Sign in failed";
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const signOut = useCallback(async () => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await firebaseSignOut(auth);
      // Clear the cross-domain session cookie so grants.thekyo.ca also signs out.
      await clearSessionCookie();
      setAuthState({
        user: null,
        loading: false,
        error: null,
      });
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Sign out failed";
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Password reset failed";
      return { success: false, error: errorMessage };
    }
  }, []);

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    isAuthenticated: !!authState.user,
  };
}
