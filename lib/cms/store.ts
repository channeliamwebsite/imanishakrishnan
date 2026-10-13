"use client";

import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  FieldPath,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  writeBatch,
  type DocumentData,
  type Firestore,
} from "firebase/firestore";
import { getClientFirebase } from "@/lib/firebase/client";
import { LIST_META_DOC_ID, PRIVATE_COLLECTIONS, SINGLETON_DOC_ID } from "@/lib/firebase/collections";
import { refreshPublishedContent } from "@/lib/admin/actions";
import { SECTIONS, type Issue, type SectionDef, type SectionKey } from "./sections";

/**
 * Draft → publish workflow for CMS sections, run in the admin's browser as the signed-in user
 * (firestore.rules allow it only for admins).
 *
 *   cmsDrafts/{key}   { data, dirty, updatedAt, updatedBy, publishedAt?, publishedBy? }
 *
 * Saving a draft never touches the published collections. Publishing validates the saved draft
 * with the same validators the public site uses, writes it to the published location in one
 * batch, and asks the server to refresh the site's cache for that collection.
 */

export type ContentSource = "draft" | "published" | "built-in";

export interface SectionState {
  data: unknown;
  source: ContentSource;
  /** True when the draft has changes that aren't on the live site yet. */
  dirty: boolean;
  updatedAt?: Date;
  updatedBy?: string;
  publishedAt?: Date;
  publishedBy?: string;
  /** Whether the section exists in the published collection (vs. built-in placeholder content). */
  isPublished: boolean;
}

export type PublishResult =
  | { ok: true; cacheRefreshed: boolean; warning?: string }
  | { ok: false; error: string; issues?: Issue[] };

function firestore(): Firestore {
  const firebase = getClientFirebase();
  if (!firebase) throw new Error("Firebase is not configured.");
  return firebase.db;
}

/** Firestore Timestamps → ISO strings, so data matches what the public site's loaders see. */
function toPlain(value: unknown): unknown {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(toPlain);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as DocumentData).map(([k, v]) => [k, toPlain(v)]));
  }
  return value;
}

const toDate = (v: unknown) => (v instanceof Timestamp ? v.toDate() : undefined);
const draftRef = (db: Firestore, key: SectionKey) => doc(db, PRIVATE_COLLECTIONS.cmsDrafts, key);

/** The published content of a section, or null when it was never published. */
export async function readPublished(def: SectionDef): Promise<unknown | null> {
  const db = firestore();
  if (def.kind === "singleton") {
    const snap = await getDoc(doc(db, def.collection, SINGLETON_DOC_ID));
    return snap.exists() ? toPlain(snap.data()) : null;
  }
  const snap = await getDocs(collection(db, def.collection));
  const hasMeta = snap.docs.some((d) => d.id === LIST_META_DOC_ID);
  const items = snap.docs
    .filter((d) => d.id !== LIST_META_DOC_ID)
    .map((d) => ({ ...(toPlain(d.data()) as object), id: d.id }) as { id: string; order?: number })
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id.localeCompare(b.id));
  return items.length || hasMeta ? items : null;
}

/** What the editor starts from: the saved draft, else the live content, else the built-in content. */
export async function loadSection(key: SectionKey): Promise<SectionState> {
  const def = SECTIONS[key];
  const db = firestore();
  const [draft, published] = await Promise.all([getDoc(draftRef(db, key)), readPublished(def)]);
  const isPublished = published !== null;
  if (draft.exists()) {
    const d = draft.data();
    return {
      data: toPlain(d.data),
      source: "draft",
      dirty: d.dirty === true,
      updatedAt: toDate(d.updatedAt),
      updatedBy: d.updatedBy,
      publishedAt: toDate(d.publishedAt),
      publishedBy: d.publishedBy,
      isPublished,
    };
  }
  if (isPublished) return { data: published, source: "published", dirty: false, isPublished };
  return { data: structuredClone(def.builtIn()), source: "built-in", dirty: false, isPublished };
}

/**
 * Saves the draft. With `paths`, only those fields of the section are written, so admin pages
 * that edit different parts of one section never overwrite each other; a cleared field is
 * removed. Without `paths` (list sections), or when no draft exists yet, `data` is replaced whole.
 */
export async function saveDraft(
  key: SectionKey,
  data: unknown,
  { by, paths }: { by: string; paths?: string[][] },
): Promise<void> {
  const db = firestore();
  const ref = draftRef(db, key);
  const stamp = { dirty: true, updatedAt: serverTimestamp(), updatedBy: by };
  if (paths?.length && (await getDoc(ref)).exists()) {
    const pairs: unknown[] = [];
    for (const path of paths) {
      const value = path.reduce<unknown>((v, segment) => (v as Record<string, unknown> | undefined)?.[segment], data);
      pairs.push(new FieldPath("data", ...path), value === undefined ? deleteField() : value);
    }
    for (const [field, value] of Object.entries(stamp)) pairs.push(field, value);
    const [first, firstValue, ...rest] = pairs;
    await updateDoc(ref, first as FieldPath, firstValue, ...rest);
    return;
  }
  // mergeFields: replace `data` entirely (no deep merge of stale keys) but keep publishedAt/By.
  await setDoc(ref, { data, ...stamp }, { mergeFields: ["data", "dirty", "updatedAt", "updatedBy"] });
}

/** Removes the draft; the editor falls back to the live (or built-in) content. */
export async function discardDraft(key: SectionKey): Promise<void> {
  await deleteDoc(draftRef(firestore(), key));
}

const withoutId = (item: Record<string, unknown>) => {
  const rest = { ...item };
  delete rest.id; // the document id carries it
  return rest;
};

/** Publishes the saved draft of a section to the live site. */
export async function publishSection(key: SectionKey, { by, idToken }: { by: string; idToken: string }): Promise<PublishResult> {
  const def = SECTIONS[key];
  const db = firestore();
  const draft = await getDoc(draftRef(db, key));
  if (!draft.exists()) return { ok: false, error: "There is no saved draft to publish." };

  const checked = def.validate(toPlain(draft.data().data));
  if (!checked.ok) return { ok: false, error: "Fix the highlighted problems before publishing.", issues: checked.issues };

  const batch = writeBatch(db);
  if (def.kind === "singleton") {
    // Replace (not merge), so fields cleared in the editor disappear from the live site.
    batch.set(doc(db, def.collection, SINGLETON_DOC_ID), checked.value as DocumentData);
  } else {
    const items = checked.value as Record<string, unknown>[];
    const keep = new Set(items.map((item) => String(item.id)));
    const existing = await getDocs(collection(db, def.collection));
    for (const d of existing.docs) if (d.id !== LIST_META_DOC_ID && !keep.has(d.id)) batch.delete(d.ref);
    items.forEach((item, i) => batch.set(doc(db, def.collection, String(item.id)), { ...withoutId(item), order: i + 1 }));
    batch.set(doc(db, def.collection, LIST_META_DOC_ID), { publishedAt: serverTimestamp(), publishedBy: by });
  }
  batch.update(draftRef(db, key), { dirty: false, publishedAt: serverTimestamp(), publishedBy: by });
  await batch.commit();

  const refreshed = await refreshPublishedContent(idToken, [def.collection]);
  return refreshed.ok
    ? { ok: true, cacheRefreshed: true }
    : {
        ok: true,
        cacheRefreshed: false,
        warning: `Published, but the site cache could not be refreshed (${refreshed.error}). Changes will appear within a few hours.`,
      };
}
