/**
 * Grants (or revokes) the admin role: creates admins/{uid}, the only thing firestore.rules and
 * lib/admin/require-admin.ts accept as proof of admin access. There is deliberately no way to do
 * this from the website.
 *
 *   npm run admin:grant -- --uid <uid>          grant (uid from Firebase console → Authentication)
 *   npm run admin:grant -- --email <email>      grant, looking the uid up by email
 *   npm run admin:grant -- --uid <uid> --revoke remove the role
 *   npm run admin:grant -- --list               list current admins
 *
 * Create the user first (Firebase console → Authentication → Add user, Email/Password).
 * Credentials: same as scripts/seed-firestore.ts (FIREBASE_SERVICE_ACCOUNT_JSON in .env.local, or
 * GOOGLE_APPLICATION_CREDENTIALS). With FIRESTORE_EMULATOR_HOST set it targets the emulator.
 */
import { loadEnvConfig } from "@next/env";
import { applicationDefault, cert, initializeApp, type Credential } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { PRIVATE_COLLECTIONS } from "@/lib/firebase/collections";

loadEnvConfig(process.cwd());

const argv = process.argv.slice(2);
const arg = (name: string) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
};

function credential(): Credential | undefined {
  if (process.env.FIRESTORE_EMULATOR_HOST) return undefined;
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (json) {
    const parsed = JSON.parse(json) as { project_id?: string; client_email?: string; private_key?: string };
    if (parsed.project_id !== process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      throw new Error("The service account belongs to a different Firebase project. Refusing to write.");
    }
    return cert({ projectId: parsed.project_id, clientEmail: parsed.client_email, privateKey: parsed.private_key });
  }
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) return applicationDefault();
  throw new Error("No Firebase Admin credentials (see the header of this file).");
}

async function main() {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) throw new Error("NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set.");
  const cred = credential();
  const app = initializeApp(cred ? { projectId, credential: cred } : { projectId }, "grant-admin");
  const admins = getFirestore(app).collection(PRIVATE_COLLECTIONS.admins);

  if (argv.includes("--list")) {
    const snap = await admins.get();
    if (snap.empty) console.log("No admins.");
    for (const d of snap.docs) console.log(`${d.id}  ${d.get("email") ?? ""}`);
    return;
  }

  let uid = arg("--uid");
  let email = arg("--email");
  if (!uid && email) uid = (await getAuth(app).getUserByEmail(email)).uid;
  if (!uid) throw new Error("Pass --uid <uid> or --email <email>.");

  if (argv.includes("--revoke")) {
    await admins.doc(uid).delete();
    console.log(`Admin role removed from ${uid}.`);
    return;
  }

  if (!email) {
    try {
      email = (await getAuth(app).getUser(uid)).email;
    } catch {
      // The email is only a label in the admins list; the uid is what grants access.
    }
  }
  await admins.doc(uid).set({ email: email ?? null, grantedAt: FieldValue.serverTimestamp() });
  console.log(`Admin role granted to ${uid}${email ? ` (${email})` : ""}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
