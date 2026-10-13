"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { EyeOff, Eye, Pencil, Save, Send, Trash2 } from "lucide-react";
import type { FieldDef } from "@/lib/cms/fields";
import { CLOUDINARY_FOLDERS } from "@/lib/cloudinary/folders";
import {
  deleteArticle,
  loadArticle,
  publishArticle,
  saveArticleDraft,
  slugify,
  unpublishArticle,
  type ArticleDraft,
  type ArticleStatus,
} from "@/lib/cms/blog";
import type { Issue } from "@/lib/cms/sections";
import { PreviewFrame } from "./PreviewFrame";
import { useAdminAuth } from "./AdminAuth";
import { FieldList, type FieldErrors } from "./form/Fields";
import { RichTextEditor } from "./form/RichTextEditor";
import { AdminButton, Badge, Notice, Panel, Spinner, TextInput } from "./ui";

const DETAILS_FIELDS: FieldDef[] = [
  { kind: "textarea", key: "excerpt", label: "Excerpt", rows: 3, help: "Shown on article cards and as the search description." },
  { kind: "image", key: "coverImage", label: "Featured image", folder: CLOUDINARY_FOLDERS.insights },
  { kind: "text", key: "author", label: "Author" },
  { kind: "text", key: "category", label: "Main category", required: true, help: "Shown on the article card." },
  { kind: "strings", key: "categories", label: "More categories", itemLabel: "Category" },
  { kind: "strings", key: "tags", label: "Tags", itemLabel: "Tag" },
  { kind: "date", key: "publishedAt", label: "Publish date", help: "The date shown on the article. Articles are sorted by it." },
  { kind: "toggle", key: "featured", label: "Featured article" },
  {
    kind: "group",
    key: "seo",
    label: "Search & sharing (optional)",
    help: "Leave empty to use the title, excerpt and featured image.",
    fields: [
      { kind: "text", key: "title", label: "SEO title" },
      { kind: "textarea", key: "description", label: "SEO description", rows: 2 },
      { kind: "image", key: "image", label: "Share image", folder: CLOUDINARY_FOLDERS.insights },
    ],
  },
];

const STATUS_BADGES: Record<ArticleStatus, React.ReactNode> = {
  draft: <Badge tone="muted">Draft — not published</Badge>,
  published: <Badge tone="live">Published</Badge>,
  changed: <Badge tone="draft">Published · unpublished changes</Badge>,
  unpublished: <Badge tone="muted">Unpublished</Badge>,
};

type Message = { tone: "success" | "error" | "warning" | "info"; text: string };

export function ArticleEditor({ id, isNew }: { id: string; isNew?: boolean }) {
  const router = useRouter();
  const { identity, getIdToken } = useAdminAuth();
  const [article, setArticle] = useState<ArticleDraft | null>(null);
  const [status, setStatus] = useState<ArticleStatus>("draft");
  const [savedJson, setSavedJson] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"save" | "publish" | "unpublish" | "delete" | null>(null);
  const [message, setMessage] = useState<Message | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [previewing, setPreviewing] = useState(false);

  useEffect(() => {
    let active = true;
    loadArticle(id).then(
      (loaded) => {
        if (!active) return;
        setArticle(loaded.article);
        setStatus(loaded.status);
        setSlugEdited(!!loaded.article.slug);
        // An article that isn't stored yet counts as unsaved, so it can be saved straight away.
        setSavedJson(loaded.exists ? JSON.stringify(loaded.article) : "");
      },
      () => active && setLoadError("Could not load this article. Check your connection and reload."),
    );
    return () => {
      active = false;
    };
  }, [id]);

  const unsaved = article !== null && JSON.stringify(article) !== savedJson;
  useEffect(() => {
    if (!unsaved) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [unsaved]);

  const errors = useMemo<FieldErrors>(() => Object.fromEntries(issues.filter((i) => i.path).map((i) => [i.path, i.message])), [issues]);

  if (loadError) return <Notice tone="error">{loadError}</Notice>;
  if (!article) return <Spinner />;

  const update = (next: ArticleDraft) => setArticle(next);

  async function save(): Promise<boolean> {
    if (!article) return false;
    setBusy("save");
    setMessage(null);
    try {
      await saveArticleDraft(article, identity);
      setSavedJson(JSON.stringify(article));
      setStatus((s) => (s === "published" ? "changed" : s));
      // Saved: drop "?new=1" (same route, so the editor isn't remounted).
      if (isNew) window.history.replaceState(null, "", `/admin/blogs/edit/${id}`);
      return true;
    } catch {
      setMessage({ tone: "error", text: "The draft could not be saved. Your edits are still here — try again." });
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function onPublish() {
    if (!window.confirm("Publish this article on the website?")) return;
    if (unsaved && !(await save())) return;
    setBusy("publish");
    setIssues([]);
    try {
      const result = await publishArticle(id, { by: identity, idToken: await getIdToken() });
      if (!result.ok) {
        setIssues(result.issues ?? []);
        setMessage({ tone: "error", text: result.error });
        return;
      }
      setStatus("published");
      setMessage(result.warning ? { tone: "warning", text: result.warning } : { tone: "success", text: `Published at /insights/${article!.slug}.` });
    } catch {
      setMessage({ tone: "error", text: "Publishing failed. Nothing on the website was changed — try again." });
    } finally {
      setBusy(null);
    }
  }

  async function onUnpublish() {
    if (!window.confirm("Take this article off the website? The draft is kept.")) return;
    setBusy("unpublish");
    try {
      const result = await unpublishArticle(id, await getIdToken());
      setStatus("unpublished");
      setMessage(result.ok && result.warning ? { tone: "warning", text: result.warning } : { tone: "info", text: "The article is no longer on the website." });
    } catch {
      setMessage({ tone: "error", text: "Could not unpublish. Try again." });
    } finally {
      setBusy(null);
    }
  }

  async function onDelete() {
    if (!window.confirm("Delete this article permanently (draft and live copy)? This can't be undone.")) return;
    setBusy("delete");
    try {
      await deleteArticle(id, await getIdToken());
      setSavedJson(JSON.stringify(article));
      router.push("/admin/blogs");
    } catch {
      setMessage({ tone: "error", text: "Could not delete the article. Try again." });
      setBusy(null);
    }
  }

  const live = status === "published" || status === "changed";

  return (
    <div className="space-y-4">
      <Panel
        title={article.title || "Untitled article"}
        description={article.slug ? `/insights/${article.slug}` : "Set a title to create the address."}
        actions={
          <>
            {STATUS_BADGES[status]}
            <AdminButton size="sm" variant="ghost" onClick={() => setPreviewing((p) => !p)} aria-pressed={previewing}>
              {previewing ? <Pencil className="size-3.5" aria-hidden /> : <Eye className="size-3.5" aria-hidden />}
              {previewing ? "Edit" : "Preview"}
            </AdminButton>
          </>
        }
      >
        <div className="space-y-5">
          {message && <Notice tone={message.tone}>{message.text}</Notice>}
          {issues.some((i) => !i.path) && (
            <Notice tone="error">{issues.filter((i) => !i.path).map((i) => i.message).join(" ")}</Notice>
          )}
          {previewing ? (
            <div className="overflow-hidden rounded-md border border-border">
              <p className="border-b border-border bg-amber-50 px-3 py-1.5 font-sans text-xs font-semibold text-amber-900">
                Preview of the current edits — not published
              </p>
              <div className="bg-background p-3">
                <PreviewFrame kind="article" data={article} />
              </div>
            </div>
          ) : (
            <>
              <TextInput
                label="Title"
                required
                value={article.title}
                error={errors.title}
                onChange={(title) => update({ ...article, title, slug: slugEdited ? article.slug : slugify(title) })}
              />
              <TextInput
                label="URL slug"
                required
                value={article.slug}
                error={errors.slug}
                help={live ? "Changing the slug of a published article breaks existing links to it." : "Lowercase letters, numbers and hyphens."}
                onChange={(slug) => {
                  setSlugEdited(true);
                  update({ ...article, slug: slugify(slug) || slug.toLowerCase() });
                }}
              />
              <RichTextEditor
                label="Article"
                value={article.body ?? ""}
                folder={CLOUDINARY_FOLDERS.insights}
                error={errors.body}
                onChange={(body) => setArticle((a) => a && { ...a, body })}
              />
              <FieldList
                fields={DETAILS_FIELDS}
                value={article as unknown as Record<string, unknown>}
                onChange={(next) => update(next as unknown as ArticleDraft)}
                errors={errors}
              />
            </>
          )}
        </div>
      </Panel>

      <div className="sticky bottom-0 z-10 -mx-1 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
        <AdminButton variant="primary" onClick={onPublish} loading={busy === "publish"} disabled={busy !== null && busy !== "publish"}>
          <Send className="size-4" aria-hidden /> {live ? "Publish changes" : "Publish"}
        </AdminButton>
        <AdminButton onClick={() => save().then((ok) => ok && setMessage({ tone: "success", text: "Draft saved. The website is unchanged until you publish." }))} loading={busy === "save"} disabled={!unsaved || (busy !== null && busy !== "save")}>
          <Save className="size-4" aria-hidden /> Save draft
        </AdminButton>
        {live && (
          <AdminButton variant="ghost" onClick={onUnpublish} loading={busy === "unpublish"} disabled={busy !== null && busy !== "unpublish"}>
            <EyeOff className="size-4" aria-hidden /> Unpublish
          </AdminButton>
        )}
        {!isNew && (
          <AdminButton variant="danger" onClick={onDelete} loading={busy === "delete"} disabled={busy !== null && busy !== "delete"}>
            <Trash2 className="size-4" aria-hidden /> Delete
          </AdminButton>
        )}
        <p className="ml-auto font-sans text-xs text-muted">{unsaved ? "Unsaved edits" : "All changes saved"}</p>
      </div>
    </div>
  );
}
