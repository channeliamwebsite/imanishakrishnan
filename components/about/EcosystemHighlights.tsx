"use client";

import { useCallback, useState } from "react";
import NextImage from "next/image";
import type { MediaAsset } from "@/types/content";
import { Lightbox } from "@/components/testimonials/TestimonialGallery";

export type Highlight = { key: string; image: MediaAsset; title?: string; meta?: string };

/**
 * Compact gallery of the /about Ecosystem Builder highlights (supporting images and the events
 * marked "Highlight on the About page"). Each image is shown whole inside a fixed frame
 * (object-contain — never cropped); clicking opens the shared full-size viewer.
 */
export function EcosystemHighlights({ items }: { items: Highlight[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const images = items.map((h) => ({ ...h.image, alt: h.image.alt || h.title || "Ecosystem Builder" }));

  return (
    <>
      <ul className="grid grid-cols-2 gap-x-5 gap-y-7 md:grid-cols-3 lg:grid-cols-4">
        {items.map((h, i) => (
          <li key={h.key}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`View full size: ${images[i].alt}`}
              className="group block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-burgundy"
            >
              <span className="relative block aspect-[4/3] overflow-hidden bg-foreground/[0.04]">
                <NextImage
                  src={h.image.url}
                  alt={images[i].alt!}
                  fill
                  sizes="(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 46vw"
                  className="object-contain transition-transform duration-500 ease-editorial motion-safe:group-hover:scale-[1.02]"
                />
              </span>
              {h.title && <span className="type-small mt-2 block text-foreground">{h.title}</span>}
              {h.meta && <span className="type-meta mt-0.5 block text-muted">{h.meta}</span>}
            </button>
          </li>
        ))}
      </ul>
      {open !== null && <Lightbox images={images} index={open} onIndex={setOpen} onClose={close} />}
    </>
  );
}
