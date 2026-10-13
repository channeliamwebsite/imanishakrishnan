"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Eye, Pencil, RotateCcw, Save, Send } from "lucide-react";
import type { FieldDef } from "@/lib/cms/fields";
import { SECTIONS, type Issue, type SectionKey } from "@/lib/cms/sections";
import { discardDraft, loadSection, publishSection, saveDraft, type SectionState } from "@/lib/cms/store";
import { useAdminAuth } from "./AdminAuth";
import { FieldList, ListField, type FieldErrors } from "./form/Fields";
import { AdminButton, Badge, Notice, Panel, Spinner } from "./ui";
import { PreviewFrame } from "./PreviewFrame";
import type { PreviewKind } from "./previews";

/**
 * Editor for one section — or one part of it (`path`) — with the full draft workflow:
 * Save draft (never touches the live site) · Preview (the real public components, with the
 * draft) · Publish (validated, then live) · Discard draft (back to the live content).
 */

type Message = { tone: "success" | "error" | "warning" | "info"; text: string };

const getAt = (data: unknown, path: string[] = []) =>
  path.reduce<unknown>((value, key) => (value as Record<string, unknown> | undefined)?.[key], data);

function setAt(data: unknown, path: string[], value: unknown): unknown {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  const obj = (data ?? {}) as Record<string, unknown>;
  return { ...obj, [head]: setAt(obj[head], rest, value) };
}

/**
 * The fields a singleton editor owns: one path per field, descending into groups, so saving
 * writes exactly what this editor shows.
 */
function ownedPaths(fields: FieldDef[], base: string[]): string[][] {
  return fields.flatMap((f) => (f.kind === "group" ? ownedPaths(f.fields, [...base, f.key]) : [[...base, f.key]]));
}

const formatDate = (d?: Date) =>
  d ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(d) : "";

export function SectionEditor({
  section,
  path: pathProp,
  title,
  description,
  fields,
  itemLabel = "Item",
  summary,
  preview,
  sharedNote,
  initial,
}: {
  section: SectionKey;
  /** Edit only this part of a singleton section (e.g. ["profile", "achievements"]). */
  path?: string[];
  title: string;
  description?: ReactNode;
  /** Singleton: fields of the edited object. List section: fields of each item. */
  fields: FieldDef[];
  itemLabel?: string;
  summary?: (item: Record<string, unknown>) => string;
  /** Which public component(s) to preview, with the full section data. */
  preview?: PreviewKind;
  /** Shown when other admin pages edit other parts of the same section. */
  sharedNote?: string;
  /** Starting value for `path` when the section has never stored it (e.g. a newly added heading). */
  initial?: unknown;
}) {
  const def = SECTIONS[section];
  const prefix = pathProp?.join(".") ?? "";
  const path = useMemo(() => (prefix ? prefix.split(".") : undefined), [prefix]);
  const { identity, getIdToken } = useAdminAuth();
  const [state, setState] = useState<SectionState | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [data, setData] = useState<unknown>(null);
  const [savedJson, setSavedJson] = useState("");
  const [busy, setBusy] = useState<"save" | "publish" | "discard" | null>(null);
  const [message, setMessage] = useState<Message | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [previewing, setPreviewing] = useState(false);

  const apply = useCallback(
    (loaded: SectionState) => {
      const next =
        path && initial !== undefined && getAt(loaded.data, path) === undefined
          ? { ...loaded, data: setAt(loaded.data, path, initial) }
          : loaded;
      setState(next);
      setData(next.data);
      setSavedJson(JSON.stringify(getAt(next.data, path)));
    },
    [path, initial],
  );

  useEffect(() => {
    let active = true;
    loadSection(section).then(
      (next) => active && apply(next),
      () => active && setLoadError("Could not load this section. Check your connection and admin access, then reload."),
    );
    return () => {
      active = false;
    };
  }, [section, apply]);

  const edited = getAt(data, path);
  const unsaved = state !== null && JSON.stringify(edited) !== savedJson;

  // Warn before leaving with unsaved edits.
  useEffect(() => {
    if (!unsaved) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [unsaved]);

  const errors = useMemo<FieldErrors>(() => {
    const map: FieldErrors = {};
    for (const issue of issues) if (issue.path && !(issue.path in map)) map[issue.path] = issue.message;
    return map;
  }, [issues]);
  const generalIssues = issues.filter((i) => !i.path || (prefix && !i.path.startsWith(prefix)));

  async function save(): Promise<boolean> {
    setBusy("save");
    setMessage(null);
    try {
      await saveDraft(section, data, {
        by: identity,
        paths: def.kind === "singleton" ? ownedPaths(fields, path ?? []) : undefined,
      });
      setSavedJson(JSON.stringify(edited));
      setState((s) => s && { ...s, source: "draft", dirty: true, updatedAt: new Date(), updatedBy: identity });
      return true;
    } catch {
      setMessage({ tone: "error", text: "The draft could not be saved. Your edits are still here — try again." });
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function onSave() {
    if (await save()) setMessage({ tone: "success", text: "Draft saved. The live site is unchanged until you publish." });
  }

  async function onPublish() {
    const note = sharedNote ? `\n\n${sharedNote}` : "";
    if (!window.confirm(`Publish ${def.label} to the live website?${note}`)) return;
    if (unsaved || state?.source !== "draft") {
      if (!(await save())) return;
    }
    setBusy("publish");
    setMessage(null);
    setIssues([]);
    try {
      const result = await publishSection(section, { by: identity, idToken: await getIdToken() });
      if (!result.ok) {
        setIssues(result.issues ?? []);
        setMessage({ tone: "error", text: result.error });
        return;
      }
      setState((s) => s && { ...s, dirty: false, isPublished: true, publishedAt: new Date(), publishedBy: identity });
      setMessage(
        result.warning
          ? { tone: "warning", text: result.warning }
          : { tone: "success", text: "Published. The live website now shows these changes." },
      );
    } catch {
      setMessage({ tone: "error", text: "Publishing failed. Nothing on the live site was changed — try again." });
    } finally {
      setBusy(null);
    }
  }

  async function onDiscard() {
    if (!window.confirm("Discard all unpublished changes to this section? This can't be undone.")) return;
    setBusy("discard");
    setMessage(null);
    setIssues([]);
    try {
      await discardDraft(section);
      apply(await loadSection(section));
      setMessage({ tone: "info", text: "Draft discarded. Showing the live content." });
    } catch {
      setMessage({ tone: "error", text: "The draft could not be discarded. Try again." });
    } finally {
      setBusy(null);
    }
  }

  if (loadError) return <Notice tone="error">{loadError}</Notice>;
  if (!state) return <Spinner />;

  const status = !state.isPublished ? (
    <Badge tone="muted">Not yet in the CMS — showing built-in content</Badge>
  ) : state.dirty ? (
    <Badge tone="draft">Unpublished changes</Badge>
  ) : (
    <Badge tone="live">Live</Badge>
  );

  const update = (next: unknown) => setData((d: unknown) => setAt(d, path ?? [], next));

  return (
    <div className="space-y-4">
      <Panel
        title={title}
        description={description}
        actions={
          <>
            {status}
            {preview && (
              <AdminButton size="sm" variant="ghost" onClick={() => setPreviewing((p) => !p)} aria-pressed={previewing}>
                {previewing ? <Pencil className="size-3.5" aria-hidden /> : <Eye className="size-3.5" aria-hidden />}
                {previewing ? "Edit" : "Preview"}
              </AdminButton>
            )}
          </>
        }
      >
        <div className="space-y-5">
          {message && <Notice tone={message.tone}>{message.text}</Notice>}
          {generalIssues.length > 0 && (
            <Notice tone="error" title="Problems to fix">
              <ul className="list-disc pl-4">
                {generalIssues.map((issue, i) => (
                  <li key={i}>{issue.path ? `${issue.path}: ${issue.message}` : issue.message}</li>
                ))}
              </ul>
            </Notice>
          )}

          {previewing && preview ? (
            <div className="overflow-hidden rounded-md border border-border">
              <p className="border-b border-border bg-amber-50 px-3 py-1.5 font-sans text-xs font-semibold text-amber-900">
                Preview of the current edits — not published
              </p>
              <div className="bg-background p-3">
                <PreviewFrame kind={preview} data={data} />
              </div>
            </div>
          ) : def.kind === "list" && !path ? (
            <ListField
              field={{
                kind: "list",
                key: "",
                label: title,
                fields,
                itemLabel,
                summary: summary ?? ((item) => String(item.title ?? item.id ?? "")),
                newItem: def.newItem ?? (() => ({})),
                visibleField: def.visibleField,
              }}
              value={(edited as Record<string, unknown>[]) ?? []}
              onChange={update}
              errors={errors}
              path=""
            />
          ) : (
            <FieldList
              fields={fields}
              value={(edited as Record<string, unknown>) ?? {}}
              onChange={update}
              errors={errors}
              path={prefix}
            />
          )}
        </div>
      </Panel>

      <div className="sticky bottom-0 z-10 -mx-1 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
        <AdminButton variant="primary" onClick={onPublish} loading={busy === "publish"} disabled={busy !== null && busy !== "publish"}>
          <Send className="size-4" aria-hidden /> Publish
        </AdminButton>
        <AdminButton onClick={onSave} loading={busy === "save"} disabled={!unsaved || (busy !== null && busy !== "save")}>
          <Save className="size-4" aria-hidden /> Save draft
        </AdminButton>
        {state.source === "draft" && (
          <AdminButton variant="ghost" onClick={onDiscard} loading={busy === "discard"} disabled={busy !== null && busy !== "discard"}>
            <RotateCcw className="size-4" aria-hidden /> Discard draft
          </AdminButton>
        )}
        <p className="ml-auto font-sans text-xs text-muted">
          {unsaved
            ? "Unsaved edits"
            : state.updatedAt
              ? `Draft saved ${formatDate(state.updatedAt)}${state.updatedBy ? ` by ${state.updatedBy}` : ""}`
              : state.publishedAt
                ? `Published ${formatDate(state.publishedAt)}`
                : ""}
        </p>
      </div>
    </div>
  );
}
