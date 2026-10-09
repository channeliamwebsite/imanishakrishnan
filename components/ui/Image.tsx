import NextImage from "next/image";
import type { MediaAsset } from "@/types/content";
import { isCloudinaryUrl } from "@/lib/cloudinary/url";
import { cn } from "@/lib/cn";

type ImageProps = {
  media?: MediaAsset;
  /**
   * CSS aspect ratio of the frame, e.g. "4/5" — the image covers the frame, so the crop is
   * fixed by layout, not by the upload. Pass null to size the frame via className, or
   * "intrinsic" to use the asset's own width/height (falls back to 4/5 when unknown).
   */
  ratio?: string | null;
  sizes?: string;
  /** Preload as the LCP image (above-the-fold hero only). */
  preload?: boolean;
  className?: string;
  imageClassName?: string;
  /** Placeholder tone when no media is set yet. */
  tone?: "light" | "dark";
};

function frameRatio(ratio: string | null, media?: MediaAsset): string | undefined {
  if (ratio === null) return undefined;
  if (ratio === "intrinsic") return media?.width && media?.height ? `${media.width}/${media.height}` : "4/5";
  return ratio;
}

/**
 * CMS image frame. Renders a Cloudinary-hosted MediaAsset through next/image (resized by
 * Cloudinary via lib/cloudinary/loader.ts), or a neutral editorial placeholder when the asset
 * is missing or its URL isn't a valid Cloudinary delivery URL. The frame always reserves its
 * space, so loading an image never shifts the layout.
 */
export function MediaImage({
  media,
  ratio = "4/5",
  sizes = "100vw",
  preload,
  className,
  imageClassName,
  tone = "light",
}: ImageProps) {
  const aspectRatio = frameRatio(ratio, media);
  const src = typeof media?.url === "string" && isCloudinaryUrl(media.url) ? media.url : undefined;

  return (
    <div className={cn("relative overflow-hidden", className)} style={aspectRatio ? { aspectRatio } : undefined}>
      {src ? (
        <NextImage
          src={src}
          alt={media?.alt ?? ""}
          fill
          sizes={sizes}
          preload={preload}
          className={cn("object-cover", imageClassName)}
        />
      ) : (
        <div
          role="img"
          aria-label={media?.alt ?? "Image placeholder"}
          className={cn(
            "absolute inset-0 flex items-start p-5",
            tone === "light"
              ? "bg-[linear-gradient(160deg,#e9e0d4_0%,#d8cbbb_100%)] text-foreground/40"
              : "bg-[linear-gradient(160deg,#4a525c_0%,#2a3038_100%)] text-white/40",
          )}
        >
          <span className="type-label">{media?.alt ?? "Image"}</span>
        </div>
      )}
    </div>
  );
}
