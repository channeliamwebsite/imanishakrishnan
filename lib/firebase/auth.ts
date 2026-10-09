import { getAuth, type Auth } from "firebase/auth";
import { getFirebaseApp } from "./config";

/** Firebase Auth instance for the future admin dashboard (client-side only). */
export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseApp();
  return app ? getAuth(app) : null;
}
