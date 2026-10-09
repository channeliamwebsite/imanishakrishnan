import "server-only";
import { v2 as cloudinary } from "cloudinary";
import type { MediaAsset } from "@/types/content";
import { isAllowedFolder, type CloudinaryFolder } from "./folders";

/**
 * Server-only Cloudinary SDK. Never import this from a client component —
 * the `server-only` import makes that a build error.
 */
export const isCloudinaryConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
);

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Signature for direct browser uploads from the admin dashboard.
 * The admin route that calls this must verify the Firebase ID token first.
 * Uploads are confined to the approved folder layout (lib/cloudinary/folders.ts).
 */
export function signUploadParams(params: Record<string, string | number> & { folder: CloudinaryFolder }) {
  if (!isCloudinaryConfigured) throw new Error("Cloudinary is not configured");
  if (!isAllowedFolder(params.folder)) throw new Error("Upload folder is not allowed");
  const timestamp = Math.round(Date.now() / 1000);
  const toSign = { ...params, timestamp };
  const signature = cloudinary.utils.api_sign_request(toSign, process.env.CLOUDINARY_API_SECRET!);
  return { ...toSign, signature, apiKey: process.env.CLOUDINARY_API_KEY! };
}

/** Normalise a Cloudinary upload response into the MediaAsset stored in Firestore. */
export function toMediaAsset(result: {
  secure_url: string;
  public_id: string;
  width?: number;
  height?: number;
  resource_type?: string;
}, alt?: string): MediaAsset {
  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    alt,
    resourceType: result.resource_type === "video" ? "video" : "image",
  };
}

export { cloudinary };
