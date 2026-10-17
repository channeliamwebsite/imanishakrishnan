"use client";

import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Eye, EyeOff, Plus, Trash2, Upload } from "lucide-react";
import type { MediaAsset } from "@/types/content";
import type { FieldDef } from "@/lib/cms/fields";
import { cn } from "@/lib/cn";
import { ACCEPT_ATTRIBUTE, uploadImage } from "@/lib/cms/media";
import { useAdminAuth } from "../AdminAuth";
import { AdminButton, Notice, SelectInput, TextArea, TextInput, Toggle } from "../ui";
import { ImageField } from "./ImageField";
import { parseYouTubeId, youTubeThumbnail } from "@/lib/youtube";

/**
 * Renders a list of FieldDefs for one object. `path` is the object's position in the section
 * data ("" for the root), used to match validation errors ("profile.achievements.groups.0.heading").
 */

type Obj = Record<string, unknown>;
export type FieldErrors = Record<string, string>;

const join = (path: string, key: string | number) => (path ? `${path}.${key}` : String(key));
const asText = (v: unknown) => (typeof v === "string" ? v : typeof v === "number" ? String(v) : "");

/** Errors at or below a path (to flag collapsed items that contain a problem). */
const hasErrorWithin = (errors: FieldErrors, path: string) =>
  Object.keys(errors).some((p) => p === path || p.startsWith(`${path}.`));

export function FieldList({
  fields,
  value,
  onChange,
  errors,
  path = "",
}: {
  fields: FieldDef[];
  value: Obj;
  onChange: (next: Obj) => void;
  errors: FieldErrors;
  path?: string;
}) {
  return (
    <div className="space-y-5">
      {fields.map((field) => (
        <Field
          key={field.key}
          field={field}
          value={value?.[field.key]}
          onChange={(v) => onChange({ ...value, [field.key]: v })}
          errors={errors}
          path={join(path, field.key)}
        />
      ))}
    </div>
  );
}

function Field({
  field,
  value,
  onChange,
  errors,
  path,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
  errors: FieldErrors;
  path: string;
}) {
  const error = errors[path];
  switch (field.kind) {
    case "text":
      return (
        <TextInput
          label={field.label}
          help={field.help}
          required={field.required}
          placeholder={field.placeholder}
          error={error}
          value={asText(value)}
          onChange={onChange}
        />
      );
    case "youtube": {
      const url = asText(value);
      const id = parseYouTubeId(url);
      return (
        <div className="space-y-2">
          <TextInput
            label={field.label}
            help={field.help ?? "Paste a YouTube link (watch, youtu.be, Shorts or embed). The video itself is not uploaded."}
            required={field.required}
            placeholder="https://www.youtube.com/watch?v=…"
            error={error ?? (url && !id ? "Not a valid YouTube video URL" : undefined)}
            value={url}
            onChange={onChange}
          />
          {id && (
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- YouTube's own thumbnail, admin preview */}
              <img src={youTubeThumbnail(id)} alt="" className="aspect-video w-40 rounded bg-background object-cover" />
              <p className="font-sans text-xs text-muted">
                Video ID: <code className="font-mono text-foreground">{id}</code>
              </p>
            </div>
          )}
        </div>
      );
    }
    case "textarea":
      return (
        <TextArea
          label={field.label}
          help={field.help}
          required={field.required}
          rows={field.rows}
          error={error}
          value={asText(value)}
          onChange={onChange}
        />
      );
    case "number":
      return (
        <TextInput
          label={field.label}
          help={field.help}
          type="number"
          error={error}
          value={asText(value)}
          onChange={(v) => onChange(v === "" ? undefined : Number(v))}
        />
      );
    case "date":
      return (
        <TextInput
          label={field.label}
          help={field.help}
          type="date"
          error={error}
          value={asText(value).slice(0, 10)}
          onChange={(v) => onChange(v || undefined)}
        />
      );
    case "toggle":
      return <Toggle label={field.label} help={field.help} checked={value === true} onChange={onChange} />;
    case "select":
      return (
        <SelectInput
          label={field.label}
          help={field.help}
          error={error}
          value={asText(value)}
          onChange={(v) => onChange(v || undefined)}
          options={[...(field.emptyLabel !== undefined ? [{ value: "", label: field.emptyLabel }] : []), ...field.options]}
        />
      );
    case "image":
      return (
        <ImageField
          label={field.label}
          help={field.help}
          folder={field.folder}
          value={value as MediaAsset | undefined}
          onChange={onChange}
          error={error ?? errors[join(path, "url")]}
          allowCrop={field.crop !== false}
          withCaption={field.caption}
        />
      );
    case "images":
      return <ImagesField field={field} value={(value as MediaAsset[]) ?? []} onChange={onChange} errors={errors} path={path} />;
    case "link":
      return <LinkField field={field} value={value as Obj | undefined} onChange={onChange} errors={errors} path={path} />;
    case "strings":
      return <StringsField field={field} value={(value as string[]) ?? []} onChange={onChange} error={error} />;
    case "group":
      return (
        <fieldset className="min-w-0 space-y-4 rounded-md border border-border p-4">
          <legend className="px-1 font-sans text-sm font-semibold text-foreground">{field.label}</legend>
          {field.help && <p className="font-sans text-xs text-muted">{field.help}</p>}
          <FieldList fields={field.fields} value={(value as Obj) ?? {}} onChange={onChange} errors={errors} path={path} />
        </fieldset>
      );
    case "list":
      return <ListField field={field} value={(value as Obj[]) ?? []} onChange={onChange} errors={errors} path={path} />;
  }
}

function LinkField({
  field,
  value,
  onChange,
  errors,
  path,
}: {
  field: Extract<FieldDef, { kind: "link" }>;
  value: Obj | undefined;
  onChange: (v: unknown) => void;
  errors: FieldErrors;
  path: string;
}) {
  const label = asText(value?.label);
  const href = asText(value?.href);
  const update = (next: { label: string; href: string }) =>
    onChange(field.optional && !next.label && !next.href ? undefined : next);
  return (
    <fieldset className="min-w-0 space-y-2">
      <legend className="font-sans text-sm font-semibold text-foreground">{field.label}</legend>
      {field.help && <p className="font-sans text-xs text-muted">{field.help}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <TextInput label="Text" value={label} error={errors[join(path, "label")] ?? errors[path]} onChange={(v) => update({ label: v, href })} />
        <TextInput
          label="Link"
          placeholder="/about, /#media or https://…"
          value={href}
          error={errors[join(path, "href")]}
          onChange={(v) => update({ label, href: v })}
        />
      </div>
    </fieldset>
  );
}

function StringsField({
  field,
  value,
  onChange,
  error,
}: {
  field: Extract<FieldDef, { kind: "strings" }>;
  value: string[];
  onChange: (v: unknown) => void;
  error?: string;
}) {
  const set = (i: number, v: string) => onChange(value.map((s, j) => (j === i ? v : s)));
  const move = (i: number, d: -1 | 1) => {
    const next = [...value];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  return (
    <fieldset className="min-w-0 space-y-2">
      <legend className="font-sans text-sm font-semibold text-foreground">{field.label}</legend>
      {field.help && <p className="font-sans text-xs text-muted">{field.help}</p>}
      <ol className="space-y-2">
        {value.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              {field.multiline ? (
                <TextArea label={`${field.itemLabel} ${i + 1}`} rows={4} value={item} onChange={(v) => set(i, v)} />
              ) : (
                <TextInput label={`${field.itemLabel} ${i + 1}`} value={item} onChange={(v) => set(i, v)} />
              )}
            </div>
            <ItemControls
              index={i}
              count={value.length}
              onMove={(d) => move(i, d)}
              onRemove={() => onChange(value.filter((_, j) => j !== i))}
              label={`${field.itemLabel} ${i + 1}`}
              className="mt-6"
            />
          </li>
        ))}
      </ol>
      <AdminButton size="sm" onClick={() => onChange([...value, ""])}>
        <Plus className="size-3.5" aria-hidden /> Add {field.itemLabel.toLowerCase()}
      </AdminButton>
      {error && <p className="font-sans text-xs font-semibold text-red-700">{error}</p>}
    </fieldset>
  );
}

function ImagesField({
  field,
  value,
  onChange,
  errors,
  path,
}: {
  field: Extract<FieldDef, { kind: "images" }>;
  value: MediaAsset[];
  onChange: (v: unknown) => void;
  errors: FieldErrors;
  path: string;
}) {
  const { getIdToken, identity } = useAdminAuth();
  const fileInput = useRef<HTMLInputElement>(null);
  // The list as last rendered, so each finished upload appends to the current value.
  const latest = useRef(value);
  latest.current = value;
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [failed, setFailed] = useState<string[]>([]);

  /** Uploads several files one after another (same signed upload as a single image). */
  async function uploadMany(files: FileList | null) {
    const list = Array.from(files ?? []);
    if (list.length === 0) return;
    setFailed([]);
    setProgress({ done: 0, total: list.length });
    for (const [i, file] of list.entries()) {
      try {
        const asset = await uploadImage(file, { folder: field.folder, idToken: await getIdToken(), by: identity });
        latest.current = [...latest.current, asset];
        onChange(latest.current);
      } catch (e) {
        setFailed((f) => [...f, `${file.name}: ${e instanceof Error ? e.message : "upload failed"}`]);
      }
      setProgress({ done: i + 1, total: list.length });
    }
    setProgress(null);
    if (fileInput.current) fileInput.current.value = "";
  }

  return (
    <fieldset className="min-w-0 space-y-3">
      <legend className="font-sans text-sm font-semibold text-foreground">{field.label}</legend>
      {field.help && <p className="font-sans text-xs text-muted">{field.help}</p>}
      {value.map((asset, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <ImageField
              label={`Image ${i + 1}`}
              folder={field.folder}
              value={asset}
              error={errors[join(path, i)] ?? errors[join(join(path, i), "url")]}
              onChange={(next) => onChange(value.map((a, j) => (j === i ? (next ?? { url: "", publicId: "" }) : a)))}
              allowCrop={field.crop !== false}
              withCaption={field.caption}
            />
          </div>
          <ItemControls
            index={i}
            count={value.length}
            label={`Image ${i + 1}`}
            className="mt-7"
            onMove={(d) => {
              const next = [...value];
              [next[i], next[i + d]] = [next[i + d], next[i]];
              onChange(next);
            }}
            onRemove={() => onChange(value.filter((_, j) => j !== i))}
          />
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-2">
        <AdminButton size="sm" onClick={() => onChange([...value, { url: "", publicId: "" }])} disabled={!!progress}>
          <Plus className="size-3.5" aria-hidden /> Add image
        </AdminButton>
        <AdminButton size="sm" variant="ghost" onClick={() => fileInput.current?.click()} disabled={!!progress}>
          <Upload className="size-3.5" aria-hidden /> Upload several
        </AdminButton>
        <input
          ref={fileInput}
          type="file"
          accept={ACCEPT_ATTRIBUTE}
          multiple
          hidden
          onChange={(e) => uploadMany(e.target.files)}
        />
        {progress && (
          <span className="font-sans text-xs text-muted" aria-live="polite">
            Uploading {progress.done + 1 > progress.total ? progress.total : progress.done + 1} of {progress.total}…
          </span>
        )}
      </div>
      {failed.length > 0 && (
        <Notice tone="error" title="Some files were not uploaded">
          <ul className="list-disc pl-4">
            {failed.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </Notice>
      )}
    </fieldset>
  );
}

function ItemControls({
  index,
  count,
  onMove,
  onRemove,
  label,
  className,
}: {
  index: number;
  count: number;
  onMove: (d: -1 | 1) => void;
  onRemove: () => void;
  label: string;
  className?: string;
}) {
  return (
    <div className={cn("flex shrink-0 gap-1", className)}>
      <AdminButton size="sm" variant="ghost" disabled={index === 0} onClick={() => onMove(-1)} aria-label={`Move ${label} up`}>
        <ArrowUp className="size-4" />
      </AdminButton>
      <AdminButton size="sm" variant="ghost" disabled={index === count - 1} onClick={() => onMove(1)} aria-label={`Move ${label} down`}>
        <ArrowDown className="size-4" />
      </AdminButton>
      <AdminButton
        size="sm"
        variant="ghost"
        onClick={() => {
          if (window.confirm(`Remove ${label}?`)) onRemove();
        }}
        aria-label={`Remove ${label}`}
      >
        <Trash2 className="size-4 text-red-700" />
      </AdminButton>
    </div>
  );
}

/** Repeatable items: collapsible cards with show/hide, reorder, remove and add. */
export function ListField({
  field,
  value,
  onChange,
  errors,
  path,
}: {
  field: Extract<FieldDef, { kind: "list" }>;
  value: Obj[];
  onChange: (v: Obj[]) => void;
  errors: FieldErrors;
  path: string;
}) {
  const [open, setOpen] = useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  const move = (i: number, d: -1 | 1) => {
    const next = [...value];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
    setOpen((prev) => new Set([...prev].map((n) => (n === i ? i + d : n === i + d ? i : n))));
  };

  return (
    <fieldset className="min-w-0 space-y-3">
      {path !== "" && <legend className="font-sans text-sm font-semibold text-foreground">{field.label}</legend>}
      {field.help && <p className="font-sans text-xs text-muted">{field.help}</p>}
      {value.length === 0 && <p className="font-sans text-sm text-muted">No items yet.</p>}
      <ol className="space-y-2">
        {value.map((item, i) => {
          const itemPath = join(path, i);
          const isOpen = open.has(i);
          const visible = field.visibleField ? item[field.visibleField] !== false : true;
          const summary = field.summary(item) || `${field.itemLabel} ${i + 1}`;
          const invalid = hasErrorWithin(errors, itemPath);
          return (
            <li key={String(item.id ?? i)} className={cn("rounded-md border bg-white", invalid ? "border-red-300" : "border-border")}>
              <div className="flex items-center gap-2 px-3 py-2">
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left font-sans"
                >
                  {isOpen ? <ChevronDown className="size-4 shrink-0" aria-hidden /> : <ChevronRight className="size-4 shrink-0" aria-hidden />}
                  <span className={cn("truncate text-[0.9375rem] font-semibold", !visible && "text-muted line-through")}>{summary}</span>
                  {invalid && <span className="shrink-0 text-xs font-semibold text-red-700">Needs attention</span>}
                </button>
                {field.visibleField && (
                  <AdminButton
                    size="sm"
                    variant="ghost"
                    onClick={() => onChange(value.map((it, j) => (j === i ? { ...it, [field.visibleField!]: !visible } : it)))}
                    aria-label={visible ? `Hide ${summary} on the site` : `Show ${summary} on the site`}
                    title={visible ? "Shown on the site — click to hide" : "Hidden — click to show"}
                  >
                    {visible ? <Eye className="size-4" /> : <EyeOff className="size-4 text-muted" />}
                  </AdminButton>
                )}
                <ItemControls
                  index={i}
                  count={value.length}
                  label={summary}
                  onMove={(d) => move(i, d)}
                  onRemove={() => {
                    onChange(value.filter((_, j) => j !== i));
                    setOpen(new Set());
                  }}
                />
              </div>
              {isOpen && (
                <div className="border-t border-border p-4">
                  <FieldList
                    fields={field.fields}
                    value={item}
                    onChange={(next) => onChange(value.map((it, j) => (j === i ? next : it)))}
                    errors={errors}
                    path={itemPath}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <AdminButton
        size="sm"
        onClick={() => {
          onChange([...value, field.newItem()]);
          setOpen((prev) => new Set(prev).add(value.length));
        }}
      >
        <Plus className="size-3.5" aria-hidden /> Add {field.itemLabel.toLowerCase()}
      </AdminButton>
    </fieldset>
  );
}
