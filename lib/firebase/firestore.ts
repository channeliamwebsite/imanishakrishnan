import {
  collection,
  connectFirestoreEmulator,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  where,
  Timestamp,
  type DocumentData,
  type Firestore,
} from "firebase/firestore/lite";
import { getFirebaseApp } from "./config";
import { SINGLETON_DOC_ID, type CollectionName } from "./collections";

/**
 * Read-only Firestore access for public pages. Uses the lightweight REST SDK
 * (no realtime listeners) which suits server rendering.
 */
let emulatorConnected = false;

function db(): Firestore | null {
  const app = getFirebaseApp();
  if (!app) return null;
  const firestore = getFirestore(app);
  // Local testing only: FIRESTORE_EMULATOR_HOST is a server-side variable that is never set in
  // production (e.g. `firebase emulators:exec`). Without it this branch does nothing.
  const emulator = process.env.FIRESTORE_EMULATOR_HOST;
  if (emulator && !emulatorConnected) {
    const [host, port] = emulator.split(":");
    connectFirestoreEmulator(firestore, host, Number(port));
    emulatorConnected = true;
  }
  return firestore;
}

/** Firestore Timestamps aren't serializable across the cache boundary — convert to ISO strings. */
function serialize(data: DocumentData): DocumentData {
  const out: DocumentData = {};
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Timestamp) out[key] = value.toDate().toISOString();
    else if (value && typeof value === "object" && !Array.isArray(value)) out[key] = serialize(value);
    else out[key] = value;
  }
  return out;
}

/** Fetch a singleton document (e.g. hero/main). Returns null if Firebase isn't configured or the doc is missing. */
export async function getSingleton<T>(name: CollectionName): Promise<T | null> {
  const firestore = db();
  if (!firestore) return null;
  const snap = await getDoc(doc(firestore, name, SINGLETON_DOC_ID));
  return snap.exists() ? (serialize(snap.data()) as T) : null;
}

/**
 * Fetch every document in a collection, unfiltered. Used for small collections (e.g. statistics)
 * where filtering/sorting in code avoids needing a composite index and tolerates incomplete docs.
 * Returns null if Firebase isn't configured.
 */
export async function getAllDocuments(name: CollectionName): Promise<Array<{ id: string; data: DocumentData }> | null> {
  const firestore = db();
  if (!firestore) return null;
  const snap = await getDocs(collection(firestore, name));
  return snap.docs.map((d) => ({ id: d.id, data: serialize(d.data()) }));
}

/**
 * Fetch the documents of a collection with `published == true` — the only query the rules allow
 * the public for collections that hide unpublished documents (insights). Equality only, so no
 * composite index is needed; callers sort in code. Returns null if Firebase isn't configured.
 */
export async function getPublishedDocuments(
  name: CollectionName,
): Promise<Array<{ id: string; data: DocumentData }> | null> {
  const firestore = db();
  if (!firestore) return null;
  const snap = await getDocs(query(collection(firestore, name), where("published", "==", true)));
  return snap.docs.map((d) => ({ id: d.id, data: serialize(d.data()) }));
}

/**
 * Fetch the published documents of a collection where `field == value` (e.g. an article by slug).
 * Equality filters only, so no composite index is needed. Returns null if Firebase isn't configured.
 */
export async function getPublishedDocumentsWhere(
  name: CollectionName,
  field: string,
  value: string,
): Promise<Array<{ id: string; data: DocumentData }> | null> {
  const firestore = db();
  if (!firestore) return null;
  const snap = await getDocs(
    query(collection(firestore, name), where("published", "==", true), where(field, "==", value)),
  );
  return snap.docs.map((d) => ({ id: d.id, data: serialize(d.data()) }));
}
