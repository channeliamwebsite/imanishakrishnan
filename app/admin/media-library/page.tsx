"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Copy, Trash2, Upload } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { useAdminAuth } from "@/components/admin/AdminAuth";
import { thumbnail } from "@/components/admin/form/ImageField";
import { AdminButton, Notice, Panel, SelectInput, Spinner, TextInput } from "@/components/admin/ui";
import { CLOUDINARY_FOLDERS, CLOUDINARY_ROOT_FOLDER } from "@/lib/cloudinary/folders";
import {
  ACCEPT_ATTRIBUTE,
  deleteLibraryEntry,
  listLibrary,
  updateLibraryAlt,
  uploadImage,
  type LibraryEntry,
} from "@/lib/cms/media";

const FOLDERS = Object.values(CLOUDINARY_FOLDERS)
  .flatMap((v) => (typeof v === "string" ? [v] : Object.values(v)))
  .map((folder) => ({ value: folder, label: folder.replace(`${CLOUDINARY_ROOT_FOLDER}/`, "") }));

const size = (bytes?: number) => (bytes ? `${Math.max(1, Math.round(bytes / 1024))} KB` : "");

function EntryCard({ entry, onDeleted }: { entry: LibraryEntry; onDeleted: () => void }) {
  const { getIdToken } = useAdminAuth();
  const [alt, setAlt] = useState(entry.alt ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [note, setNote] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  async function saveAlt() {
    setSaving(true);
    try {
      await updateLibraryAlt(entry.id, alt);
      setNote({ tone: "success", text: "Saved. Images already placed on the site keep the alt text set there." });
    } catch {
      setNote({ tone: "error", text: "Could not save." });
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (
      !window.confirm(
        "Delete this image from Cloudinary? Any page still using it will show an empty frame. This can't be undone.",
      )
    )
      return;
    setDeleting(true);
    try {
      await deleteLibraryEntry(entry, await getIdToken());
      onDeleted();
    } catch (e) {
      setNote({ tone: "error", text: e instanceof Error ? e.message : "Could not delete." });
      setDeleting(false);
    }
  }

  return (
    <li className="overflow-hidden rounded-md border border-border bg-white">
      {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail, resized by Cloudinary */}
      <img src={thumbnail(entry.url, 480)} alt={entry.alt ?? ""} className="aspect-[4/3] w-full bg-background object-contain" />
      <div className="space-y-3 p-3 font-sans">
        <div className="text-xs text-muted">
          <p className="truncate font-semibold text-foreground" title={entry.publicId}>
            {entry.publicId.split("/").pop()}
          </p>
          <p>
            {[entry.width && entry.height ? `${entry.width}×${entry.height}` : "", size(entry.bytes), entry.folder.replace(`${CLOUDINARY_ROOT_FOLDER}/`, "")]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <TextInput label="Alt text" value={alt} onChange={setAlt} />
        {note && <Notice tone={note.tone}>{note.text}</Notice>}
        <div className="flex flex-wrap gap-2">
          <AdminButton size="sm" onClick={saveAlt} loading={saving} disabled={alt === (entry.alt ?? "")}>
            Save alt text
          </AdminButton>
          <AdminButton size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(entry.url)} aria-label="Copy image URL">
            <Copy className="size-3.5" aria-hidden /> URL
          </AdminButton>
          <AdminButton size="sm" variant="danger" onClick={remove} loading={deleting} aria-label="Delete image">
            <Trash2 className="size-3.5" aria-hidden />
          </AdminButton>
        </div>
      </div>
    </li>
  );
}

export default function MediaLibraryPage() {
  const { getIdToken, identity } = useAdminAuth();
  const [entries, setEntries] = useState<LibraryEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [folder, setFolder] = useState<string>(CLOUDINARY_FOLDERS.site);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const refresh = useCallback(
    () =>
      listLibrary().then(setEntries, () => setError("Could not load the media library. Check your connection and reload.")),
    [],
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    try {
      const token = await getIdToken();
      for (const file of Array.from(files)) await uploadImage(file, { folder, idToken: token, by: identity });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  const shown = (entries ?? []).filter((e) => `${e.publicId} ${e.alt ?? ""}`.toLowerCase().includes(filter.trim().toLowerCase()));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Media library"
        description="Images uploaded through the admin (stored in Cloudinary). Images can also be uploaded directly from any image field."
      />
      <Panel title="Upload">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-64">
            <SelectInput label="Folder" value={folder} onChange={setFolder} options={FOLDERS} />
          </div>
          <input ref={fileInput} type="file" multiple accept={ACCEPT_ATTRIBUTE} className="sr-only" onChange={(e) => onFiles(e.target.files)} />
          <AdminButton variant="primary" loading={uploading} onClick={() => fileInput.current?.click()}>
            <Upload className="size-4" aria-hidden /> Upload images
          </AdminButton>
        </div>
        <p className="mt-2 font-sans text-xs text-muted">JPG, PNG, WebP, AVIF, GIF or SVG, up to 10 MB each.</p>
      </Panel>
      {error && <Notice tone="error">{error}</Notice>}
      <div className="max-w-sm">
        <TextInput label="Search" value={filter} onChange={setFilter} placeholder="File name or alt text" />
      </div>
      {!entries && !error && <Spinner />}
      {entries && shown.length === 0 && <p className="font-sans text-muted">No images yet.</p>}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((entry) => (
          <EntryCard key={entry.id} entry={entry} onDeleted={() => setEntries((list) => list?.filter((e) => e.id !== entry.id) ?? null)} />
        ))}
      </ul>
    </div>
  );
}
