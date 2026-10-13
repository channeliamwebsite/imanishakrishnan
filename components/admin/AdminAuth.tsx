"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { getClientFirebase } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { verifyAdminSession } from "@/lib/admin/actions";

/**
 * Admin session. Signing in is Firebase Auth (email + password, accounts created in the Firebase
 * console — there is no registration). After sign-in the server verifies the ID token and the
 * admins/{uid} role (verifyAdminSession). Hiding pages here is only a convenience: the data
 * itself is protected by firestore.rules and by the same check inside every server action.
 */

type Status = "loading" | "unconfigured" | "signed-out" | "checking" | "denied" | "admin";

interface AdminAuthValue {
  status: Status;
  user: User | null;
  /** Display name for audit fields (updatedBy / publishedBy). */
  identity: string;
  message?: string;
  signIn: (email: string, password: string) => Promise<string | null>;
  resetPassword: (email: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  /** A fresh ID token for server actions. */
  getIdToken: () => Promise<string>;
}

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

export function useAdminAuth(): AdminAuthValue {
  const value = useContext(AdminAuthContext);
  if (!value) throw new Error("useAdminAuth must be used inside <AdminAuthProvider>");
  return value;
}

function signInError(code: string | undefined): string {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
    case "auth/invalid-email":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a few minutes and try again.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/operation-not-allowed":
      return "Email sign-in is not enabled for this Firebase project.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return "Sign-in failed. Please try again.";
  }
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  // Firebase is initialised in effects and handlers only — never while rendering (prerender).
  const [status, setStatus] = useState<Status>(isFirebaseConfigured ? "loading" : "unconfigured");
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState<string>();

  useEffect(() => {
    const firebase = getClientFirebase();
    if (!firebase) return;
    return onAuthStateChanged(firebase.auth, async (next) => {
      setUser(next);
      if (!next) {
        setStatus("signed-out");
        return;
      }
      setStatus("checking");
      const result = await verifyAdminSession(await next.getIdToken());
      if (result.ok) {
        setMessage(undefined);
        setStatus("admin");
      } else {
        setMessage(result.error);
        setStatus("denied");
      }
    });
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const firebase = getClientFirebase();
    if (!firebase) return "Firebase is not configured.";
    try {
      await signInWithEmailAndPassword(firebase.auth, email.trim(), password);
      return null;
    } catch (error) {
      return signInError((error as { code?: string }).code);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const firebase = getClientFirebase();
    if (!firebase) return "Firebase is not configured.";
    try {
      await sendPasswordResetEmail(firebase.auth, email.trim());
    } catch {
      // Same reply whether or not the account exists.
    }
    return null;
  }, []);

  const signOut = useCallback(async () => {
    const firebase = getClientFirebase();
    if (firebase) await firebaseSignOut(firebase.auth);
  }, []);

  const getIdToken = useCallback(async () => {
    if (!user) throw new Error("Not signed in");
    return user.getIdToken();
  }, [user]);

  const value = useMemo<AdminAuthValue>(
    () => ({
      status,
      user,
      identity: user?.email ?? user?.uid ?? "",
      message,
      signIn,
      resetPassword,
      signOut,
      getIdToken,
    }),
    [status, user, message, signIn, resetPassword, signOut, getIdToken],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
