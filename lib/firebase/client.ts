"use client";

import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore, initializeFirestore, type Firestore } from "firebase/firestore";
import { getFirebaseApp } from "./config";

/**
 * Browser-side Firebase for the admin dashboard: Auth plus the full Firestore SDK (writes,
 * batches, server timestamps). Requests carry the signed-in admin's credentials, and
 * firestore.rules decide what they may read or write. The public site never imports this.
 */
let db: Firestore | undefined;
let auth: Auth | undefined;

/** Local testing only (never set in production): the host running the Auth + Firestore emulators. */
const EMULATOR_HOST = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST;

export function getClientFirebase(): { auth: Auth; db: Firestore } | null {
  const app = getFirebaseApp();
  if (!app) return null;
  if (!db || !auth) {
    try {
      // Optional fields are left undefined by the forms; Firestore would otherwise reject them.
      db = initializeFirestore(app, { ignoreUndefinedProperties: true });
      auth = getAuth(app);
      if (EMULATOR_HOST) {
        connectFirestoreEmulator(db, EMULATOR_HOST, 8080);
        connectAuthEmulator(auth, `http://${EMULATOR_HOST}:9099`, { disableWarnings: true });
      }
    } catch {
      db = getFirestore(app); // already initialised (e.g. after a hot reload)
      auth = getAuth(app);
    }
  }
  return { auth, db };
}
