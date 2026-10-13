"use client";

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
} from "firebase/firestore";
import type { Insight } from "@/types/content";
import { getClientFirebase } from "@/lib/firebase/client";
import { COLLECTIONS, PRIVATE_COLLECTIONS } from "@/lib/firebase/collections";
import { insightSchema, listIssues } from "@/lib/content/schemas";
import { refreshPublishedContent } from "@/lib/admin/actions";
import type { Issue } from "./sections";

/**
 * Blog articles. The editable copy lives in insightDrafts/{id} (admins only); publishing copies
 * a validated article to insights/{id} with `published: true`, the only articles the public can
 * read (firestore.rules). Unpublishing sets `published: false` there; the draft is kept.
 */

/** The fields edited in the admin (published state and timestamps are managed here). */
export type ArticleDraft = Omit<Insight, "published" | "order" | "createdAt" | "updatedAt">;

export type ArticleStatus = "draft" | "published" | "changed" | "unpublished";

export interface ArticleSummary {
  id: string;
  title: string;
  slug: string;
  status: ArticleStatus;
  publishedAt?: string;
  updatedAt?: Date;
}

function db() {
  const firebase = getClientFirebase();
  if (!firebase) throw new Error("Firebase is not configured.");
  return firebase.db;
}

const draftRef = (id: string) => doc(db(), PRIVATE_COLLECTIONS.insightDrafts, id);
const liveRef = (id: string) => doc(db(), COLLECTIONS.insights, id);
const toDate = (v: unknown) => (v instanceof Timestamp ? v.toDate() : undefined);

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

export function emptyArticle(id: string): ArticleDraft {
  return {
    id,
    slug: "",
    title: "",
    excerpt: "",
    category: "",
    publishedAt: new Date().toISOString().slice(0, 10),
    featured: false,
    body: "",
  };
}

function statusOf(draft: DocumentData | undefined, live: DocumentData | undefined): ArticleStatus {
  if (!live) return "draft";
  if (live.published !== true) return "unpublished";
  return draft?.dirty === true ? "changed" : "published";
}

export async function listArticles(): Promise<ArticleSummary[]> {
  const [drafts, live] = await Promise.all([
    getDocs(collection(db(), PRIVATE_COLLECTIONS.insightDrafts)),
    getDocs(collection(db(), COLLECTIONS.insights)),
  ]);
  const liveById = new Map(live.docs.map((d) => [d.id, d.data()]));
  const draftById = new Map(drafts.docs.map((d) => [d.id, d.data()]));
  const ids = new Set([...draftById.keys(), ...liveById.keys()]);
  return [...ids]
    .map((id) => {
      const draft = draftById.get(id);
      const article = (draft?.article ?? liveById.get(id) ?? {}) as Partial<ArticleDraft>;
      return {
        id,
        title: article.title || "(untitled)",
        slug: article.slug ?? "",
        publishedAt: article.publishedAt,
        status: statusOf(draft, liveById.get(id)),
        updatedAt: toDate(draft?.updatedAt),
      };
    })
    .sort((a, b) => (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0) || (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
}

export interface LoadedArticle {
  article: ArticleDraft;
  status: ArticleStatus;
  exists: boolean;
}

export async function loadArticle(id: string): Promise<LoadedArticle> {
  const [draft, live] = await Promise.all([getDoc(draftRef(id)), getDoc(liveRef(id))]);
  const liveData = live.exists() ? live.data() : undefined;
  const draftData = draft.exists() ? draft.data() : undefined;
  const source = (draftData?.article ?? liveData) as Partial<ArticleDraft> | undefined;
  return {
    article: { ...emptyArticle(id), ...source, id },
    status: statusOf(draftData, liveData),
    exists: !!source,
  };
}

export async function saveArticleDraft(article: ArticleDraft, by: string): Promise<void> {
  await setDoc(
    draftRef(article.id),
    { article, dirty: true, updatedAt: serverTimestamp(), updatedBy: by },
    { mergeFields: ["article", "dirty", "updatedAt", "updatedBy"] },
  );
}

/** Another article (draft or live) already using this slug. */
async function slugTaken(slug: string, id: string): Promise<boolean> {
  const [live, drafts] = await Promise.all([
    getDocs(query(collection(db(), COLLECTIONS.insights), where("slug", "==", slug))),
    getDocs(query(collection(db(), PRIVATE_COLLECTIONS.insightDrafts), where("article.slug", "==", slug))),
  ]);
  return [...live.docs, ...drafts.docs].some((d) => d.id !== id);
}

export type PublishArticleResult = { ok: true; warning?: string } | { ok: false; error: string; issues?: Issue[] };

/** Validates the saved draft and makes it the live article. */
export async function publishArticle(id: string, { by, idToken }: { by: string; idToken: string }): Promise<PublishArticleResult> {
  const [draft, live] = await Promise.all([getDoc(draftRef(id)), getDoc(liveRef(id))]);
  if (!draft.exists()) return { ok: false, error: "Save the article before publishing." };
  const article = draft.data().article as ArticleDraft;
  const now = new Date().toISOString();
  const createdAt = (live.exists() ? live.data().createdAt : undefined) ?? now;

  const checked = insightSchema.safeParse({ ...article, id, published: true, order: 0, createdAt, updatedAt: now });
  if (!checked.success) return { ok: false, error: "Fix the highlighted problems before publishing.", issues: listIssues(checked.error) };
  if (await slugTaken(checked.data.slug, id)) {
    return { ok: false, error: "Another article already uses this URL slug.", issues: [{ path: "slug", message: "Already used by another article" }] };
  }

  const value: Record<string, unknown> = { ...checked.data };
  delete value.id; // the document id carries it
  const batch = writeBatch(db());
  batch.set(liveRef(id), value);
  batch.update(draftRef(id), { dirty: false, publishedAt: serverTimestamp(), publishedBy: by });
  await batch.commit();
  return refresh(idToken);
}

/** Takes the article off the website; the draft stays so it can be published again. */
export async function unpublishArticle(id: string, idToken: string): Promise<PublishArticleResult> {
  await updateDoc(liveRef(id), { published: false });
  return refresh(idToken);
}

/** Deletes the article entirely (draft and live copy). */
export async function deleteArticle(id: string, idToken: string): Promise<PublishArticleResult> {
  const live = await getDoc(liveRef(id));
  await Promise.all([deleteDoc(draftRef(id)), live.exists() ? deleteDoc(liveRef(id)) : Promise.resolve()]);
  return live.exists() ? refresh(idToken) : { ok: true };
}

async function refresh(idToken: string): Promise<PublishArticleResult> {
  const result = await refreshPublishedContent(idToken, [COLLECTIONS.insights]);
  return result.ok
    ? { ok: true }
    : { ok: true, warning: `Saved, but the site cache could not be refreshed (${result.error}). The change will appear within a few hours.` };
}
