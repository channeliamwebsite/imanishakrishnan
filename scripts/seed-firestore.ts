/**
 * One-time, server-only Firestore seed for the initial website content (hero + statistics).
 *
 *   npm run seed:firestore              write (idempotent: set + merge, never deletes)
 *   npm run seed:firestore -- --dry-run validate + check the image, write nothing
 *   npm run seed:firestore -- --verify  read back and type-check what is in Firestore
 *
 * Credentials (server-side only, never NEXT_PUBLIC_*):
 *   FIREBASE_SERVICE_ACCOUNT_JSON  the service-account key JSON, as one line, in .env.local
 *   or GOOGLE_APPLICATION_CREDENTIALS pointing at the key file.
 * With FIRESTORE_EMULATOR_HOST set, it targets the local emulator and needs no credentials.
 *
 * This script is not imported by the app, so firebase-admin never reaches a browser bundle.
 */
import { loadEnvConfig } from "@next/env";
import { applicationDefault, cert, initializeApp, type Credential } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { COLLECTIONS, SINGLETON_DOC_ID } from "@/lib/firebase/collections";
import { parseHero, parseStatistic } from "@/lib/content/normalize";
import { isCloudinaryUrl, publicIdFromUrl } from "@/lib/cloudinary/url";
import type { HeroContent, ImpactStatistic, MediaAsset } from "@/types/content";

loadEnvConfig(process.cwd());

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has("--dry-run");
const VERIFY_ONLY = args.has("--verify");
const EMULATOR = process.env.FIRESTORE_EMULATOR_HOST;

/* ------------------------------------------------------------------ */
/* Seed content — approved values only                                 */
/* ------------------------------------------------------------------ */

/**
 * Only the delivery URL is known, so publicId is deliberately absent (not invented).
 * lib/content/normalize.ts accepts this — the image renders and a server-side warning notes
 * the missing publicId until the admin can record it. width/height likewise not invented.
 */
type SeedImage = Omit<MediaAsset, "publicId"> & { publicId?: string };
const HERO_IMAGE: SeedImage = {
  url: "https://res.cloudinary.com/a6fctgvh/image/upload/v1791513509/profile.jpg",
  alt: "Nisha Krishnan",
};

const HERO: Omit<HeroContent, "image"> = {
  eyebrow: "IDEAS | PEOPLE | IMPACT",
  name: "I'm Nisha Krishnan",
  designation: "Founder & CEO",
  roles: ["Journalist", "Media Entrepreneur"],
  description: "Building platforms, amplifying ideas and creating impact through the power of storytelling.",
  location: "KOCHI / INDIA",
  primaryCta: { label: "EXPLORE MY JOURNEY", link: "/#about" },
  secondaryCta: { label: "WATCH VIDEO", url: "" },
};

const STATISTICS: Array<Omit<ImpactStatistic, "id" | "icon"> & { id: string }> = [
  { id: "stat-1", value: "23+", title: "YEARS IN MEDIA", description: "A journey of impactful storytelling", order: 1, active: true },
  { id: "stat-2", value: "15,000+", title: "BUSINESS STORIES", description: "Stories produced through Channeliam", order: 2, active: true },
  { id: "stat-3", value: "2016", title: "FOUNDED CHANNELIAM", description: "Building a platform for entrepreneurs and businesses", order: 3, active: true },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const log = (msg = "") => console.log(msg);

/** Thrown for expected failures; main() prints it and sets a non-zero exit code. */
class SeedError extends Error {}
const fail = (msg: string): never => {
  throw new SeedError(msg);
};

/**
 * The image is only written when the URL is a Cloudinary delivery URL for this account and
 * publicly loads as an image; when a publicId is supplied it must match the URL. Nothing is guessed.
 */
async function checkImage(image: SeedImage): Promise<string[]> {
  const problems: string[] = [];
  if (!isCloudinaryUrl(image.url)) {
    problems.push(`url is not a Cloudinary delivery URL for cloud "${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? ""}"`);
    return problems;
  }
  const urlPublicId = publicIdFromUrl(image.url);
  if (image.publicId !== undefined && urlPublicId !== image.publicId) {
    problems.push(`Cloudinary URL/public ID mismatch detected — url points at public ID "${urlPublicId ?? "(unknown)"}", publicId is "${image.publicId}"`);
  }
  try {
    const res = await fetch(image.url, { method: "HEAD" });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok) problems.push(`url is not publicly viewable: HTTP ${res.status} ${res.headers.get("x-cld-error") ?? ""}`.trim());
    else if (!type.startsWith("image/")) problems.push(`url did not return an image (content-type "${type}")`);
  } catch (error) {
    problems.push(`url could not be fetched: ${error instanceof Error ? error.message : String(error)}`);
  }
  return problems;
}

function credential(): Credential | undefined {
  if (EMULATOR) return undefined; // emulator accepts unauthenticated admin writes
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (json) {
    let parsed: { project_id?: string; client_email?: string; private_key?: string };
    try {
      parsed = JSON.parse(json);
    } catch {
      return fail("FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON (paste the key file contents on one line).");
    }
    if (!parsed.client_email || !parsed.private_key) fail("FIREBASE_SERVICE_ACCOUNT_JSON is missing client_email/private_key.");
    if (parsed.project_id !== process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      fail("The service account belongs to a different Firebase project than NEXT_PUBLIC_FIREBASE_PROJECT_ID. Refusing to write.");
    }
    return cert({ projectId: parsed.project_id, clientEmail: parsed.client_email, privateKey: parsed.private_key });
  }
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) return applicationDefault();
  return fail(
    "No Firebase Admin credentials. Add FIREBASE_SERVICE_ACCOUNT_JSON to .env.local (Firebase Console → Project settings → Service accounts → Generate new private key), or set GOOGLE_APPLICATION_CREDENTIALS.",
  );
}

function connect(): Firestore {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) fail("NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set.");
  const cred = credential();
  // firebase-admin rejects `credential: undefined`; omit the key for the emulator.
  const app = initializeApp(cred ? { projectId, credential: cred } : { projectId }, "seed");
  return getFirestore(app);
}

/** Read back the seeded documents and confirm exact Firestore types and app validation. */
async function verify(db: Firestore) {
  log("\nVerifying Firestore contents…");
  const errors: string[] = [];
  const expectType = (path: string, field: string, value: unknown, type: string) => {
    const actual = Array.isArray(value) ? "array" : value === null ? "null" : typeof value;
    if (actual !== type) errors.push(`${path}.${field}: expected ${type}, found ${actual}`);
  };

  const heroSnap = await db.collection(COLLECTIONS.hero).doc(SINGLETON_DOC_ID).get();
  if (!heroSnap.exists) errors.push("hero/main is missing");
  else {
    const d = heroSnap.data()!;
    for (const f of ["eyebrow", "name", "designation", "description", "location"]) expectType("hero/main", f, d[f], "string");
    expectType("hero/main", "roles", d.roles, "array");
    expectType("hero/main", "primaryCta", d.primaryCta, "object");
    expectType("hero/main", "secondaryCta", d.secondaryCta, "object");
    const parsed = parseHero(d, { primaryCta: HERO.primaryCta });
    if (parsed.value === null) errors.push(`hero/main fails app validation: ${parsed.error}`);
    else parsed.warnings.forEach((w) => log(`  ⚠ hero/main: ${w}`));
    log(`  hero/main  ✓ fields: ${Object.keys(d).sort().join(", ")}${d.image ? "" : "  (no image)"}`);
  }

  const statSnap = await db.collection(COLLECTIONS.statistics).get();
  for (const s of STATISTICS) {
    const doc = statSnap.docs.find((x) => x.id === s.id);
    if (!doc) {
      errors.push(`statistics/${s.id} is missing`);
      continue;
    }
    const d = doc.data();
    expectType(`statistics/${s.id}`, "value", d.value, "string");
    expectType(`statistics/${s.id}`, "title", d.title, "string");
    expectType(`statistics/${s.id}`, "order", d.order, "number");
    expectType(`statistics/${s.id}`, "active", d.active, "boolean");
    const parsed = parseStatistic(s.id, d);
    if (parsed.value === null) errors.push(`statistics/${s.id} fails app validation: ${parsed.error}`);
    log(`  statistics/${s.id}  ✓ ${d.value} — ${d.title} (order ${typeof d.order} ${d.order}, active ${typeof d.active} ${d.active})`);
  }
  const extra = statSnap.docs.map((d) => d.id).filter((id) => !STATISTICS.some((s) => s.id === id));
  if (extra.length) log(`  ℹ other statistics documents left untouched: ${extra.join(", ")}`);

  const collections = (await db.listCollections()).map((c) => c.id).sort();
  log(`  collections in (default): ${collections.join(", ") || "(none)"}`);

  if (errors.length) fail(`Verification failed:\n  - ${errors.join("\n  - ")}`);
  log("✓ Verification passed.");
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

async function main() {
  log(`Firestore seed — ${EMULATOR ? `emulator ${EMULATOR}` : `project ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "(unset)"}`}${DRY_RUN ? " (dry run)" : ""}${VERIFY_ONLY ? " (verify only)" : ""}`);

  if (VERIFY_ONLY) return verify(connect());

  // 1. Validate with the same rules the website uses — the seed must pass them unmodified.
  const heroCheck = parseHero({ ...HERO, image: HERO_IMAGE }, { primaryCta: HERO.primaryCta });
  if (heroCheck.value === null) fail(`hero/main does not pass validation: ${heroCheck.error}`);
  for (const s of STATISTICS) {
    const r = parseStatistic(s.id, s);
    if (r.value === null) fail(`statistics/${s.id} does not pass validation: ${r.error}`);
  }
  log("✓ Seed data passes lib/content/normalize.ts validation.");

  // 2. Check the hero image before publishing it.
  const imageProblems = await checkImage(HERO_IMAGE);
  const includeImage = imageProblems.length === 0;
  if (includeImage) {
    log(
      HERO_IMAGE.publicId === undefined
        ? "✓ Hero image URL loads publicly (no publicId supplied — stored without one)."
        : "✓ Hero image URL loads publicly and matches its public ID.",
    );
  }
  else {
    log("\n⚠ Hero image NOT written — fix in Cloudinary/seed data, then re-run:");
    imageProblems.forEach((p) => log(`  - ${p}`));
    log(`  supplied url:      ${HERO_IMAGE.url}`);
    log(`  supplied publicId: ${HERO_IMAGE.publicId}`);
  }

  if (DRY_RUN) {
    log("\nDry run — nothing written.");
    return;
  }

  // 3. Write. set + merge is idempotent and never removes other fields or documents.
  const db = connect();
  const batch = db.batch();
  batch.set(
    db.collection(COLLECTIONS.hero).doc(SINGLETON_DOC_ID),
    includeImage ? { ...HERO, image: HERO_IMAGE } : HERO,
    { merge: true },
  );
  for (const { id, ...data } of STATISTICS) {
    batch.set(db.collection(COLLECTIONS.statistics).doc(id), data, { merge: true });
  }
  await batch.commit();
  log(`\n✓ Wrote hero/main and statistics/${STATISTICS.map((s) => s.id).join(", statistics/")}.`);

  await verify(db);
  if (!includeImage) process.exitCode = 2; // content seeded, image still outstanding
}

// No process.exit(): let pending network handles close normally, then exit with this code.
main().catch((error) => {
  console.error(`\n✖ ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
