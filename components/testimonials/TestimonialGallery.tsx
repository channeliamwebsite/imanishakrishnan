"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import NextImage from "next/image";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import type { MediaAsset } from "@/types/content";
import { cn } from "@/lib/cn";

const altText = (image: MediaAsset, index: number) => image.alt?.trim() || `Testimonial ${index + 1}`;

/** Gallery columns: 1 on small phones, 2 from 480px, 3 from 1024px. */
const COLUMN_QUERIES = ["(min-width: 1024px)", "(min-width: 480px)"] as const;
function useColumns(): number {
  return useSyncExternalStore(
    (notify) => {
      const lists = COLUMN_QUERIES.map((q) => window.matchMedia(q));
      lists.forEach((l) => l.addEventListener("change", notify));
      return () => lists.forEach((l) => l.removeEventListener("change", notify));
    },
    () => (window.matchMedia(COLUMN_QUERIES[0]).matches ? 3 : window.matchMedia(COLUMN_QUERIES[1]).matches ? 2 : 1),
    () => 3,
  );
}

/**
 * One testimonial at its natural proportions — the image already contains its wooden frame, so
 * there is no card, border or fill around it. Fades in once loaded; a missing file becomes a
 * neutral note instead of a broken icon.
 */
function TestimonialImage({
  image,
  index,
  sizes,
  priority,
  onOpen,
  capped,
}: {
  image: MediaAsset;
  index: number;
  sizes: string;
  priority?: boolean;
  /** Desktop: cap the height (tall images narrow instead of growing), never cropping. */
  capped?: boolean;
  onOpen: (button: HTMLButtonElement, index: number) => void;
}) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const width = image.width ?? 1080;
  const height = image.height ?? 1080;
  return (
    <button
      type="button"
      onClick={(e) => onOpen(e.currentTarget, index)}
      aria-label={`Open ${altText(image, index)}`}
      className="group block w-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-burgundy"
    >
      {status === "error" ? (
        <span
          role="img"
          aria-label={altText(image, index)}
          className="type-meta flex items-center justify-center text-subtle"
          style={{ aspectRatio: `${width}/${height}` }}
        >
          Image unavailable
        </span>
      ) : (
        <NextImage
          src={image.url}
          alt={altText(image, index)}
          width={width}
          height={height}
          sizes={sizes}
          preload={priority}
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          className={cn(
            capped ? "mx-auto h-auto max-h-none w-full lg:max-h-[22rem] lg:w-auto lg:max-w-full" : "h-auto w-full",
            "transition-[opacity,transform] duration-500 ease-editorial motion-safe:group-hover:scale-[1.015]",
            status === "loaded" ? "opacity-100" : "opacity-0",
          )}
        />
      )}
    </button>
  );
}

/** Full-screen view of one image. Escape closes; arrow keys and buttons move; focus stays inside. */
export function Lightbox({
  images,
  index,
  onIndex,
  onClose,
}: {
  images: MediaAsset[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  // The image whose file has finished loading; a new index shows the spinner until its own loads.
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const count = images.length;
  const image = images[index];
  const loaded = loadedUrl === image.url;
  const go = useCallback((d: 1 | -1) => onIndex((index + d + count) % count), [index, count, onIndex]);

  useEffect(() => {
    closeButton.current?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowRight") go(1);
    else if (e.key === "ArrowLeft") go(-1);
    else if (e.key === "Tab") {
      // Keep keyboard focus inside the dialog.
      const focusable = dialog.current?.querySelectorAll<HTMLElement>("button");
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const control =
    "grid size-11 place-items-center rounded-full border border-white/40 text-white transition-colors hover:bg-white hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

  return (
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label={`${altText(image, index)} (${index + 1} of ${count})`}
      onKeyDown={onKeyDown}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-50 flex flex-col bg-foreground/95 px-4 py-4 sm:px-6"
    >
      <div className="flex items-center justify-between text-white">
        <p className="type-meta text-white/70" aria-live="polite">
          {index + 1} / {count}
        </p>
        <button ref={closeButton} type="button" onClick={onClose} aria-label="Close" className={control}>
          <X className="size-5" aria-hidden />
        </button>
      </div>

      <div className="relative min-h-0 flex-1 py-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
        {!loaded && (
          <span aria-hidden className="absolute inset-0 m-auto size-8 animate-spin rounded-full border-2 border-white/25 border-t-white" />
        )}
        <NextImage
          key={image.url}
          src={image.url}
          alt={altText(image, index)}
          fill
          sizes="100vw"
          onLoad={() => setLoadedUrl(image.url)}
          className={cn("object-contain transition-opacity duration-300", loaded ? "opacity-100" : "opacity-0")}
        />
      </div>

      {count > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button type="button" onClick={() => go(-1)} aria-label="Previous testimonial" className={control}>
            <ArrowLeft className="size-4" aria-hidden />
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Next testimonial" className={control}>
            <ArrowRight className="size-4" aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * /testimonials: an editorial collage (one large testimonial, two beside it, with previous/next to
 * bring others forward) above a masonry-style gallery of the rest at their natural proportions.
 * Columns are filled in reading order, so "Load more" only appends — nothing reshuffles.
 * Every image opens the lightbox; images below the fold load lazily.
 */
export function TestimonialGallery({ images, pageSize = 12 }: { images: MediaAsset[]; pageSize?: number }) {
  const [start, setStart] = useState(0);
  const [shown, setShown] = useState(pageSize);
  const [open, setOpen] = useState<number | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const columns = useColumns();

  const close = useCallback(() => {
    setOpen(null);
    opener.current?.focus();
  }, []);
  const openAt = useCallback((button: HTMLButtonElement, index: number) => {
    opener.current = button;
    setOpen(index);
  }, []);

  if (images.length === 0) return <p className="type-body text-muted">Testimonials will be added here soon.</p>;

  const count = images.length;
  const featuredCount = Math.min(3, count);
  const featured = Array.from({ length: featuredCount }, (_, i) => (start + i) % count);
  const rest = images.map((_, i) => i).slice(featuredCount);
  const visibleRest = rest.slice(0, shown);
  const columnLists = Array.from({ length: columns }, (_, c) => visibleRest.filter((_, i) => i % columns === c));
  const canRotate = count > featuredCount;
  const control =
    "grid size-11 place-items-center rounded-full border border-rose/50 text-burgundy transition-colors hover:border-burgundy hover:bg-burgundy hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy";

  return (
    <>
      {/* Featured collage */}
      <div className="grid items-start gap-5 lg:grid-cols-12 lg:gap-8" aria-live="polite">
        <div className="lg:col-span-7">
          <TestimonialImage
            key={`f0-${featured[0]}`}
            image={images[featured[0]]}
            index={featured[0]}
            priority
            sizes="(min-width: 1024px) 56vw, 100vw"
            onOpen={openAt}
          />
        </div>
        {featured.length > 1 && (
          <div className="grid grid-cols-2 gap-5 lg:col-span-5 lg:grid-cols-1 lg:gap-8">
            {featured.slice(1).map((i, n) => (
              <TestimonialImage
                key={`f${n + 1}-${i}`}
                image={images[i]}
                index={i}
                priority
                sizes="(min-width: 1024px) 38vw, 50vw"
                capped
                onOpen={openAt}
              />
            ))}
          </div>
        )}
      </div>
      {canRotate && (
        <div className="mt-6 flex items-center gap-4">
          <button type="button" onClick={() => setStart((s) => (s - 1 + count) % count)} aria-label="Previous featured testimonial" className={control}>
            <ArrowLeft className="size-4" aria-hidden />
          </button>
          <button type="button" onClick={() => setStart((s) => (s + 1) % count)} aria-label="Next featured testimonial" className={control}>
            <ArrowRight className="size-4" aria-hidden />
          </button>
          <span aria-hidden className="h-px w-16 bg-rose/40" />
          <span className="type-meta tabular-nums text-muted">
            {String(start + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
          </span>
        </div>
      )}

      {/* Gallery of the remaining testimonials */}
      {rest.length > 0 && (
        <>
          <div className="mt-16 flex items-center gap-4 lg:mt-20">
            <span className="type-label text-rose">More voices</span>
            <span aria-hidden className="h-px flex-1 bg-rose/25" />
          </div>
          <div className="mt-8 flex items-start gap-5 lg:gap-8">
            {columnLists.map((list, c) => (
              <ul key={c} className="flex min-w-0 flex-1 flex-col gap-5 lg:gap-8">
                {list.map((i) => (
                  <li key={images[i].publicId || i}>
                    <TestimonialImage
                      image={images[i]}
                      index={i}
                      sizes="(min-width: 1024px) 30vw, (min-width: 480px) 48vw, 100vw"
                      onOpen={openAt}
                    />
                  </li>
                ))}
              </ul>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-center gap-4">
            <p className="type-meta text-muted" aria-live="polite">
              Showing {featuredCount + visibleRest.length} of {count}
            </p>
            {shown < rest.length && (
              <button
                type="button"
                onClick={() => setShown((n) => n + pageSize)}
                className="type-button group inline-flex h-12 items-center gap-3 border border-burgundy bg-background px-7 text-burgundy transition-colors duration-300 hover:bg-burgundy hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
              >
                Load more testimonials
                <ArrowRight className="size-3.5 transition-transform duration-300 ease-editorial motion-safe:group-hover:translate-x-1" aria-hidden />
              </button>
            )}
          </div>
        </>
      )}

      {open !== null && <Lightbox images={images} index={open} onIndex={setOpen} onClose={close} />}
    </>
  );
}
