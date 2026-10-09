"use client";

import { transformCloudinaryUrl } from "./url";

/**
 * Global next/image loader (next.config.ts → images.loaderFile).
 *
 * Cloudinary does the resizing and format negotiation (AVIF/WebP) at its CDN edge, so images
 * aren't re-processed by the Next.js optimizer. `c_limit` only scales down — it never crops —
 * so the visual crop stays exactly as defined by CSS (object-cover / object-position).
 */
export default function cloudinaryLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  return transformCloudinaryUrl(src, { width, crop: "limit", quality: quality ?? "auto" });
}
