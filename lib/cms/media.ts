"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import type { MediaAsset } from "@/types/content";
import { getClientFirebase } from "@/lib/firebase/client";
import { PRIVATE_COLLECTIONS } from "@/lib/firebase/collections";
import { deleteCloudinaryAsset, signCloudinaryUpload } from "@/lib/admin/actions";

/**
 * Admin uploads: signed direct upload to Cloudinary (the API secret never leaves the server),
 * then a record in mediaLibrary/{id} so the asset can be found, reused and managed later.
 */

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "image/svg+xml"];
export const ACCEPT_ATTRIBUTE = ACCEPTED.join(",");

export interface LibraryEntry extends MediaAsset {
  id: string;
  folder: string;
  format?: string;
  bytes?: number;
  uploadedAt?: Date;
  uploadedBy?: string;
}

function db() {
  const firebase = getClientFirebase();
  if (!firebase) throw new Error("Firebase is not configured.");
  return firebase.db;
}

export async function uploadImage(
  file: File,
  { folder, alt, idToken, by }: { folder: string; alt?: string; idToken: string; by: string },
): Promise<MediaAsset> {
  if (!ACCEPTED.includes(file.type)) throw new Error("Please choose a JPG, PNG, WebP, AVIF, GIF or SVG image.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Images must be 10 MB or smaller.");

  const signed = await signCloudinaryUpload(idToken, folder);
  if (!signed.ok) throw new Error(signed.error);
  const { cloudName, apiKey, timestamp, signature } = signed.upload;

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("signature", signature);
  form.append("folder", signed.upload.folder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, {
    method: "POST",
    body: form,
  });
  const result = (await response.json().catch(() => ({}))) as {
    secure_url?: string;
    public_id?: string;
    width?: number;
    height?: number;
    format?: string;
    bytes?: number;
    error?: { message?: string };
  };
  if (!response.ok || !result.secure_url || !result.public_id) {
    throw new Error(result.error?.message ? `Upload failed: ${result.error.message}` : "Upload failed. Please try again.");
  }

  const asset: MediaAsset = {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    alt: alt?.trim() || undefined,
  };
  await addDoc(collection(db(), PRIVATE_COLLECTIONS.mediaLibrary), {
    ...asset,
    folder,
    format: result.format,
    bytes: result.bytes,
    uploadedAt: serverTimestamp(),
    uploadedBy: by,
  });
  return asset;
}

export async function listLibrary(): Promise<LibraryEntry[]> {
  const snap = await getDocs(query(collection(db(), PRIVATE_COLLECTIONS.mediaLibrary), orderBy("uploadedAt", "desc")));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      ...(data as Omit<LibraryEntry, "id" | "uploadedAt">),
      id: d.id,
      uploadedAt: data.uploadedAt instanceof Timestamp ? data.uploadedAt.toDate() : undefined,
    };
  });
}

export async function updateLibraryAlt(id: string, alt: string): Promise<void> {
  await updateDoc(doc(db(), PRIVATE_COLLECTIONS.mediaLibrary, id), { alt: alt.trim() || null });
}

/** Deletes the file from Cloudinary and its library record. */
export async function deleteLibraryEntry(entry: LibraryEntry, idToken: string): Promise<void> {
  const result = await deleteCloudinaryAsset(idToken, entry.publicId);
  if (!result.ok) throw new Error(result.error);
  await deleteDoc(doc(db(), PRIVATE_COLLECTIONS.mediaLibrary, entry.id));
}

/** The MediaAsset to store in content from a library entry (library-only fields dropped). */
export const toAsset = ({ url, publicId, width, height, alt }: LibraryEntry): MediaAsset => ({ url, publicId, width, height, alt });
