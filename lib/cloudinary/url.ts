/**
 * Client-safe Cloudinary helpers. Only the cloud name is public;
 * the API key/secret live in lib/cloudinary/server.ts.
 */
export const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";

const CLOUDINARY_HOST = "res.cloudinary.com";
/** /<cloud>/<image|video>/upload/<…> */
const DELIVERY_PATH = /^\/([^/]+)\/(image|video)\/upload\/(.+)$/;

export interface CloudinaryTransform {
  width?: number;
  height?: number;
  crop?: "fill" | "fit" | "limit" | "thumb";
  gravity?: "auto" | "face" | "faces";
  quality?: "auto" | number;
}

/** "f_auto,q_auto[,c_…,g_…,w_…,h_…]" — automatic format & quality are always applied. */
function transformation({ width, height, crop = "fill", gravity = "auto", quality = "auto" }: CloudinaryTransform) {
  const parts = ["f_auto", `q_${quality}`];
  if (width || height) {
    parts.push(`c_${crop}`);
    // Gravity only applies to cropping modes.
    if (crop === "fill" || crop === "thumb") parts.push(`g_${gravity}`);
    if (width) parts.push(`w_${Math.round(width)}`);
    if (height) parts.push(`h_${Math.round(height)}`);
  }
  return parts.join(",");
}

/** Build a delivery URL from a public ID. */
export function cloudinaryUrl(
  publicId: string,
  transform: CloudinaryTransform = {},
  resourceType: "image" | "video" = "image",
): string {
  return `https://${CLOUDINARY_HOST}/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload/${transformation(transform)}/${publicId}`;
}

/**
 * True for an https Cloudinary delivery URL (…/image/upload/…). When the cloud name is
 * configured, the URL must also belong to that account — other accounts' assets are rejected.
 */
export function isCloudinaryUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== "https:" || url.hostname !== CLOUDINARY_HOST) return false;
  const match = url.pathname.match(DELIVERY_PATH);
  if (!match) return false;
  return !CLOUDINARY_CLOUD_NAME || match[1] === CLOUDINARY_CLOUD_NAME;
}

/**
 * The public ID a stored secure_url points at: the path after "/upload/v<version>/" minus the
 * file extension (".../upload/v1791513509/profile.jpg" → "profile"). Upload responses always
 * include the version segment; without it the path is ambiguous, so undefined is returned.
 */
export function publicIdFromUrl(value: string): string | undefined {
  if (!isCloudinaryUrl(value)) return undefined;
  const [, , , rest] = new URL(value).pathname.match(DELIVERY_PATH)!;
  const segments = rest.split("/");
  const versionIndex = segments.findIndex((s) => /^v\d+$/.test(s));
  if (versionIndex === -1) return undefined;
  const path = decodeURIComponent(segments.slice(versionIndex + 1).join("/"));
  return path.replace(/\.[a-z0-9]+$/i, "") || undefined;
}

/**
 * Prepend a raw transformation component (e.g. an effect) to a stored secure_url, keeping the
 * asset and version. The global loader still adds sizing/format on top. Non-Cloudinary URLs
 * are returned unchanged.
 */
export function withCloudinaryTransformation(value: string, component: string): string {
  if (!isCloudinaryUrl(value)) return value;
  const url = new URL(value);
  const [, cloud, resourceType, rest] = url.pathname.match(DELIVERY_PATH)!;
  url.pathname = `/${cloud}/${resourceType}/upload/${component}/${rest}`;
  return url.toString();
}

/**
 * Add delivery transformations to a stored secure_url (e.g. from Firestore), keeping the
 * original asset and any transformations already in the URL. Non-Cloudinary URLs are
 * returned unchanged.
 */
export function transformCloudinaryUrl(value: string, transform: CloudinaryTransform): string {
  if (!isCloudinaryUrl(value)) return value;
  const url = new URL(value);
  const [, cloud, resourceType, rest] = url.pathname.match(DELIVERY_PATH)!;
  url.pathname = `/${cloud}/${resourceType}/upload/${transformation(transform)}/${rest}`;
  return url.toString();
}
