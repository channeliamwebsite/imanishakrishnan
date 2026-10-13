"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import NextImage from "next/image";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import type { MediaAsset } from "@/types/content";
import { cn } from "@/lib/cn";

const PAGE_SIZE = 20;

const altText = (image: MediaAsset, index: number) => image.alt?.trim() || `Testimonial ${index + 1}`;

/** One testimonial image at its own aspect ratio, with a soft placeholder until it has loaded. */
function GalleryImage({ image, index, sizes, priority }: { image: MediaAsset; index: number; sizes: string; priority?: boolean }) {
  const [loaded, setLoaded] = useState(false);
  const known = image.width && image.height;
  return (
    <div
      className={cn("relative overflow-hidden bg-surface", !loaded && "animate-pulse bg-border/60")}
      style={{ aspectRatio: known ? `${image.width}/${image.height}` : "4/5" }}
    >
      <NextImage
        src={image.url}
        alt={altText(image, index)}
        fill
        sizes={sizes}
        preload={priority}
        onLoad={() => setLoaded(true)}
        className={cn(
          "object-contain transition-[opacity,transform] duration-500 ease-editorial motion-safe:group-hover:scale-[1.02]",
          loaded ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}

/** Full-screen view of one image. Escape closes; arrow keys and buttons move; focus stays inside. */
function Lightbox({
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
 * All testimonial images: a grid that keeps each image's proportions (nothing is cropped),
 * revealed PAGE_SIZE at a time, each opening a lightbox. Images below the fold load lazily.
 */
export function TestimonialGallery({ images }: { images: MediaAsset[] }) {
  const [shown, setShown] = useState(PAGE_SIZE);
  const [open, setOpen] = useState<number | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => {
    setOpen(null);
    opener.current?.focus();
  }, []);

  if (images.length === 0) {
    return <p className="type-body text-muted">Testimonials will be added here soon.</p>;
  }

  const visible = images.slice(0, shown);
  return (
    <>
      <ul className="grid grid-cols-1 items-start gap-4 min-[420px]:grid-cols-2 lg:grid-cols-4 lg:gap-5 2xl:grid-cols-5">
        {visible.map((image, i) => (
          <li key={image.publicId || i}>
            <button
              type="button"
              onClick={(e) => {
                opener.current = e.currentTarget;
                setOpen(i);
              }}
              aria-label={`Open ${altText(image, i)}`}
              className="group block w-full border hairline transition-shadow duration-300 hover:shadow-[0_8px_24px_rgba(28,26,26,0.08)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
            >
              <GalleryImage
                image={image}
                index={i}
                priority={i < 4}
                sizes="(min-width: 1536px) 19vw, (min-width: 1024px) 23vw, (min-width: 420px) 48vw, 100vw"
              />
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex flex-col items-center gap-3">
        <p className="type-meta text-muted" aria-live="polite">
          Showing {visible.length} of {images.length}
        </p>
        {shown < images.length && (
          <button
            type="button"
            onClick={() => setShown((n) => n + PAGE_SIZE)}
            className="type-button inline-flex h-12 items-center border border-foreground/80 px-6 text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            Load more
          </button>
        )}
      </div>

      {open !== null && <Lightbox images={visible} index={open} onIndex={setOpen} onClose={close} />}
    </>
  );
}
