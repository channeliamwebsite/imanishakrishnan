"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Crop, ImageIcon, Images, Trash2, Upload, X } from "lucide-react";
import type { MediaAsset } from "@/types/content";
import { transformCloudinaryUrl } from "@/lib/cloudinary/url";
import { ACCEPT_ATTRIBUTE, listLibrary, toAsset, uploadImage, type LibraryEntry } from "@/lib/cms/media";
import { useAdminAuth } from "../AdminAuth";
import { AdminButton, Notice, Spinner, TextInput } from "../ui";
import { ImageCrop } from "./ImageCrop";

/** Small preview through Cloudinary (non-Cloudinary URLs are shown as-is). */
export const thumbnail = (url: string, width = 480) => transformCloudinaryUrl(url, { width, crop: "limit" });

/** Grid of uploaded images to pick from (media library). */
export function MediaPicker({ onPick, onClose }: { onPick: (asset: MediaAsset) => void; onClose: () => void }) {
  const [entries, setEntries] = useState<LibraryEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    listLibrary()
      .then(setEntries)
      .catch(() => setError("Could not load the media library."));
  }, []);

  const shown = (entries ?? []).filter((e) =>
    `${e.publicId} ${e.alt ?? ""}`.toLowerCase().includes(filter.trim().toLowerCase()),
  );

  return (
    <div role="dialog" aria-modal="true" aria-label="Media library" className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="font-sans text-lg font-semibold">Choose an image</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <X className="size-5" />
          </button>
        </div>
        <div className="border-b border-border px-5 py-3">
          <TextInput label="Search" value={filter} onChange={setFilter} placeholder="File name or alt text" />
        </div>
        <div className="overflow-y-auto p-5">
          {error && <Notice tone="error">{error}</Notice>}
          {!entries && !error && <Spinner />}
          {entries && shown.length === 0 && <p className="font-sans text-muted">No images yet — upload one first.</p>}
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {shown.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => onPick(toAsset(entry))}
                  className="group block w-full overflow-hidden rounded-md border border-border text-left hover:border-burgundy focus-visible:outline-2 focus-visible:outline-burgundy"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnails, already resized by Cloudinary */}
                  <img src={thumbnail(entry.url, 320)} alt={entry.alt ?? ""} className="aspect-square w-full bg-background object-contain" />
                  <span className="block truncate px-2 py-1 font-sans text-xs text-muted">{entry.publicId.split("/").pop()}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function ImageField({
  label,
  help,
  folder,
  value,
  onChange,
  error,
  allowCrop = true,
  withCaption = false,
}: {
  label: string;
  help?: string;
  folder: string;
  value: MediaAsset | undefined;
  onChange: (value: MediaAsset | undefined) => void;
  error?: string;
  /** Offer the optional crop. Never applied automatically; off for logos and icons. */
  allowCrop?: boolean;
  /** Show a caption input. */
  withCaption?: boolean;
}) {
  const { getIdToken, identity } = useAdminAuth();
  const inputId = useId();
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [cropping, setCropping] = useState(false);
  const hasImage = !!value?.url;
  // Cropping needs the source's pixel size, which every CMS upload records.
  const source = value?.original ?? value;
  const canCrop = allowCrop && hasImage && !!source?.width && !!source?.height;

  async function onFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const asset = await uploadImage(file, { folder, alt: value?.alt, idToken: await getIdToken(), by: identity });
      onChange({ ...asset, alt: value?.alt ?? asset.alt });
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <fieldset className="min-w-0 space-y-2">
      <legend className="font-sans text-sm font-semibold text-foreground">{label}</legend>
      <div className="flex flex-col gap-4 rounded-md border border-dashed border-border p-3 sm:flex-row">
        <div className="flex aspect-[4/3] w-full shrink-0 items-center justify-center overflow-hidden rounded bg-background sm:w-44">
          {hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- admin preview, resized by Cloudinary
            <img src={thumbnail(value!.url)} alt={value?.alt ?? ""} className="size-full object-contain" />
          ) : (
            <span className="flex flex-col items-center gap-1 font-sans text-xs text-muted">
              <ImageIcon className="size-6" aria-hidden />
              No image
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInput}
              id={inputId}
              type="file"
              accept={ACCEPT_ATTRIBUTE}
              className="sr-only"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
            <AdminButton size="sm" loading={uploading} onClick={() => fileInput.current?.click()}>
              <Upload className="size-3.5" aria-hidden /> {hasImage ? "Replace" : "Upload"}
            </AdminButton>
            <AdminButton size="sm" onClick={() => setPicking(true)}>
              <Images className="size-3.5" aria-hidden /> Choose from library
            </AdminButton>
            {canCrop && (
              <AdminButton size="sm" onClick={() => setCropping(true)}>
                <Crop className="size-3.5" aria-hidden /> {value?.original ? "Edit crop" : "Crop"}
              </AdminButton>
            )}
            {hasImage && (
              <AdminButton size="sm" variant="danger" onClick={() => onChange(value?.alt ? { url: "", publicId: "", alt: value.alt } : undefined)}>
                <Trash2 className="size-3.5" aria-hidden /> Remove
              </AdminButton>
            )}
          </div>
          <TextInput
            label="Alt text"
            help="Describes the image for screen readers and search engines."
            value={value?.alt ?? ""}
            onChange={(alt) => onChange({ url: "", publicId: "", ...value, alt: alt || undefined })}
          />
          {withCaption && (
            <TextInput
              label="Caption (optional)"
              value={value?.caption ?? ""}
              onChange={(caption) => onChange({ url: "", publicId: "", ...value, caption: caption || undefined })}
            />
          )}
          {value?.original && (
            <p className="font-sans text-xs text-muted">
              Cropped to {value.width} × {value.height} px from the original {value.original.width} × {value.original.height} px — the uploaded file is unchanged.
            </p>
          )}
          {help && <p className="font-sans text-xs text-muted">{help}</p>}
          {uploadError && <Notice tone="error">{uploadError}</Notice>}
          {error && <p className="font-sans text-xs font-semibold text-red-700">{error}</p>}
        </div>
      </div>
      {cropping && value && (
        <ImageCrop
          asset={value}
          onCancel={() => setCropping(false)}
          onApply={(next) => {
            onChange(next);
            setCropping(false);
          }}
        />
      )}
      {picking && (
        <MediaPicker
          onClose={() => setPicking(false)}
          onPick={(asset) => {
            onChange({ ...asset, alt: asset.alt ?? value?.alt });
            setPicking(false);
          }}
        />
      )}
    </fieldset>
  );
}
