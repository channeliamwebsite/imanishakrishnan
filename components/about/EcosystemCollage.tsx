import Link from "next/link";
import NextImage from "next/image";
import type { MediaAsset } from "@/types/content";
import { cn } from "@/lib/cn";

/**
 * Up to four event photographs for the /about Ecosystem Enabler section, composed by count:
 * one wide image; two side by side; one tall beside two stacked; or a 2 × 2 grid. Photographs
 * fill their frames (object-cover — these are event photos, not certificates). Each links to the
 * full gallery on /ecosystem-enabler.
 */
export function EcosystemCollage({ photos, href }: { photos: MediaAsset[]; href: string }) {
  const n = Math.min(photos.length, 4);
  const shown = photos.slice(0, n);
  const frame = (i: number) =>
    n === 1
      ? "aspect-[3/2]"
      : n === 2
        ? "aspect-[4/5]"
        : n === 3
          ? i === 0
            ? "row-span-2 h-full min-h-[16rem]"
            : "aspect-[4/3]"
          : "aspect-[4/3]";

  return (
    <ul className={cn("grid gap-3 sm:gap-4", n > 1 && "grid-cols-2")}>
      {shown.map((photo, i) => (
        <li key={`${photo.publicId}-${i}`} className={cn(n === 3 && i === 0 && "row-span-2")}>
          <Link
            href={href}
            aria-label={`${photo.alt || "Event photograph"} — view all ecosystem engagements`}
            className={cn(
              "group relative block w-full overflow-hidden bg-foreground/[0.05] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-burgundy",
              frame(i),
            )}
          >
            <NextImage
              src={photo.url}
              alt={photo.alt || "Event photograph"}
              fill
              sizes={n === 1 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 26vw, 50vw"}
              className="object-cover transition-transform duration-700 ease-editorial motion-safe:group-hover:scale-[1.04]"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
