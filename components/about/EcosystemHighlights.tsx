"use client";

import { useCallback, useState } from "react";
import NextImage from "next/image";
import type { MediaAsset } from "@/types/content";
import { Lightbox } from "@/components/testimonials/TestimonialGallery";

/** One card of the /about Ecosystem Builder gallery: an event (or a supporting image). */
export type Highlight = {
  key: string;
  /** All photographs of the event; the first is the card image. */
  images: MediaAsset[];
  title?: string;
  /** Organisation or event name. */
  organisation?: string;
  /** Formatted date or year. */
  date?: string;
  description?: string;
};

/**
 * Event gallery of the /about Ecosystem Builder section — 1 column on phones, 2 on tablets, 3 on
 * desktop. Every card has the same 4:3 image area; the photograph is shown whole inside it
 * (object-contain, never stretched or cropped). Clicking opens the shared full-size viewer with
 * all of that event's photographs.
 */
export function EcosystemHighlights({ items }: { items: Highlight[] }) {
  const [open, setOpen] = useState<{ images: MediaAsset[]; index: number } | null>(null);
  const close = useCallback(() => setOpen(null), []);

  return (
    <>
      <ul className="grid gap-x-card gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((h) => {
          const label = h.title || "Ecosystem Builder";
          const images = h.images.map((m, i) => ({ ...m, alt: m.alt || (h.images.length > 1 ? `${label} — photograph ${i + 1}` : label) }));
          const meta = [h.organisation, h.date].filter(Boolean).join(" · ");
          return (
            <li key={h.key}>
              <article>
                <button
                  type="button"
                  onClick={() => setOpen({ images, index: 0 })}
                  aria-label={`View full size: ${label}`}
                  className="group relative block aspect-[4/3] w-full overflow-hidden bg-foreground/[0.04] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-burgundy"
                >
                  <NextImage
                    src={images[0].url}
                    alt={images[0].alt!}
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw"
                    className="object-contain transition-transform duration-500 ease-editorial motion-safe:group-hover:scale-[1.02]"
                  />
                  {images.length > 1 && (
                    <span className="type-meta absolute bottom-2 right-2 bg-background/90 px-2 py-0.5 text-foreground">
                      {images.length} photos
                    </span>
                  )}
                </button>
                {h.title && <h3 className="type-h4 mt-4 text-foreground">{h.title}</h3>}
                {meta && <p className="type-meta mt-1 text-rose">{meta}</p>}
                {h.description && <p className="type-small mt-2 line-clamp-3 text-muted">{h.description}</p>}
              </article>
            </li>
          );
        })}
      </ul>
      {open && <Lightbox images={open.images} index={open.index} onIndex={(index) => setOpen({ ...open, index })} onClose={close} />}
    </>
  );
}
