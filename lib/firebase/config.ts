import { getApp, getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";

/**
 * Firebase web config. These values are public by design (they identify the project,
 * they don't grant access) — security is enforced by Firestore rules and Auth.
 */
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** True once the env vars are filled in. Until then the site renders placeholder content. */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
);

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured) return null;
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}
