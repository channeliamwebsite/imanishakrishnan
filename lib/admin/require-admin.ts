import "server-only";
import { getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { PRIVATE_COLLECTIONS } from "@/lib/firebase/collections";

/**
 * Server-side admin check for server actions and route handlers.
 *
 * 1. The Firebase ID token is verified with firebase-admin. Verification needs only the public
 *    project id (Google's signing keys are fetched by the SDK) — no service-account secret.
 * 2. The admin role is the existence of admins/{uid}. It is read through the Firestore REST API
 *    *with the caller's own token*, so firestore.rules apply: a user can read only their own
 *    admins document, and nobody can create one from a client.
 *
 * Never trust a uid or role sent by the client — only what this function returns.
 */

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "";
const VERIFIER_APP = "cms-token-verifier";

export type AdminIdentity = { uid: string; email?: string };

export class AdminAuthError extends Error {}

function verifierApp(): App {
  return getApps().find((app) => app.name === VERIFIER_APP) ?? initializeApp({ projectId: PROJECT_ID }, VERIFIER_APP);
}

function adminDocUrl(uid: string): string {
  // Local testing only: FIRESTORE_EMULATOR_HOST is never set in production.
  const emulator = process.env.FIRESTORE_EMULATOR_HOST;
  const origin = emulator ? `http://${emulator}` : "https://firestore.googleapis.com";
  return `${origin}/v1/projects/${PROJECT_ID}/databases/(default)/documents/${PRIVATE_COLLECTIONS.admins}/${encodeURIComponent(uid)}`;
}

export async function requireAdmin(idToken: unknown): Promise<AdminIdentity> {
  if (!PROJECT_ID) throw new AdminAuthError("Firebase is not configured.");
  if (typeof idToken !== "string" || !idToken || idToken.length > 8192) throw new AdminAuthError("Please sign in.");

  let uid: string;
  let email: string | undefined;
  try {
    const decoded = await getAuth(verifierApp()).verifyIdToken(idToken);
    uid = decoded.uid;
    email = decoded.email;
  } catch {
    throw new AdminAuthError("Your session has expired. Please sign in again.");
  }

  let response: Response;
  try {
    response = await fetch(adminDocUrl(uid), {
      headers: { Authorization: `Bearer ${idToken}` },
      cache: "no-store",
    });
  } catch {
    throw new AdminAuthError("Could not verify admin access. Please try again.");
  }
  if (!response.ok) throw new AdminAuthError("This account does not have admin access.");
  return { uid, email };
}
