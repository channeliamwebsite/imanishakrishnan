"use server";

import { revalidatePath, updateTag } from "next/cache";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { CLOUDINARY_CLOUD_NAME } from "@/lib/cloudinary/url";
import { CLOUDINARY_ROOT_FOLDER, isAllowedFolder } from "@/lib/cloudinary/folders";
import { cloudinary, isCloudinaryConfigured, signUploadParams } from "@/lib/cloudinary/server";
import { AdminAuthError, requireAdmin } from "./require-admin";

/**
 * Server actions used by the admin dashboard. Server actions are public HTTP endpoints, so every
 * one re-verifies the caller (requireAdmin) and validates its inputs; errors are returned as
 * values because thrown messages are hidden in production.
 */

export type ActionResult<T = object> = ({ ok: true } & T) | { ok: false; error: string };

async function guard<T>(idToken: unknown, run: () => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  try {
    await requireAdmin(idToken);
    return await run();
  } catch (error) {
    if (error instanceof AdminAuthError) return { ok: false, error: error.message };
    console.error("[admin] action failed:", error instanceof Error ? error.message : error);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

/** Confirms the signed-in user is an admin (used by the dashboard shell after sign-in). */
export async function verifyAdminSession(idToken: string): Promise<ActionResult<{ email?: string }>> {
  try {
    const { email } = await requireAdmin(idToken);
    return { ok: true, email };
  } catch (error) {
    return { ok: false, error: error instanceof AdminAuthError ? error.message : "Could not verify access." };
  }
}

const CACHE_TAGS = new Set<string>(Object.values(COLLECTIONS));

/** Refreshes the public site's cached content for the collections that were just published. */
export async function refreshPublishedContent(idToken: string, tags: string[]): Promise<ActionResult> {
  return guard(idToken, async () => {
    if (!Array.isArray(tags) || tags.length === 0 || !tags.every((t) => CACHE_TAGS.has(t))) {
      return { ok: false, error: "Unknown content section." };
    }
    for (const tag of new Set(tags)) updateTag(tag);
    // Article pages rendered on demand keep their own route cache (page and head); refresh them too,
    // so a newly published, edited or removed article is correct on the very next request.
    if (tags.includes(COLLECTIONS.insights)) {
      revalidatePath("/insights");
      revalidatePath("/insights/[slug]", "page");
    }
    return { ok: true };
  });
}

export type UploadSignature = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
};

/** Signs one direct browser upload into an allowed Cloudinary folder. */
export async function signCloudinaryUpload(
  idToken: string,
  folder: string,
): Promise<ActionResult<{ upload: UploadSignature }>> {
  return guard<{ upload: UploadSignature }>(idToken, async () => {
    if (!isCloudinaryConfigured) return { ok: false, error: "Cloudinary is not configured on the server." };
    if (!isAllowedFolder(folder)) return { ok: false, error: "That upload folder is not allowed." };
    const signed = signUploadParams({ folder });
    return {
      ok: true,
      upload: {
        cloudName: CLOUDINARY_CLOUD_NAME,
        apiKey: signed.apiKey,
        timestamp: signed.timestamp,
        signature: signed.signature,
        folder,
      },
    };
  });
}

/** Deletes an uploaded asset from Cloudinary. Only assets under the site's root folder. */
export async function deleteCloudinaryAsset(idToken: string, publicId: string): Promise<ActionResult> {
  return guard(idToken, async () => {
    if (!isCloudinaryConfigured) return { ok: false, error: "Cloudinary is not configured on the server." };
    if (
      typeof publicId !== "string" ||
      !publicId.startsWith(`${CLOUDINARY_ROOT_FOLDER}/`) ||
      publicId.includes("..") ||
      publicId.length > 300
    ) {
      return { ok: false, error: "Only assets uploaded through the admin can be deleted." };
    }
    const result = (await cloudinary.uploader.destroy(publicId, { invalidate: true })) as { result?: string };
    if (result.result !== "ok" && result.result !== "not found") {
      return { ok: false, error: "Cloudinary could not delete the asset." };
    }
    return { ok: true };
  });
}
