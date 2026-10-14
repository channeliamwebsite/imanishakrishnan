"use client";

import { useCallback, useRef, useState } from "react";
import NextImage from "next/image";
import type { MediaAsset } from "@/types/content";
import { Lightbox } from "@/components/testimonials/TestimonialGallery";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Supporting images of a work detail page: shown whole at their own proportions, with optional
 * captions, opening the shared lightbox (Escape closes, arrow keys move, focus returns).
 */
export function WorkGallery({ images, label }: { images: MediaAsset[]; label: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const close = useCallback(() => {
    setOpen(null);
    opener.current?.focus();
  }, []);

  return (
    <>
      <ul className="grid items-start gap-x-card gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((media, i) => (
          <li key={media.publicId || i}>
            <Reveal delay={Math.min(i, 3) * 0.06}>
              <figure>
                <button
                  type="button"
                  onClick={(e) => {
                    opener.current = e.currentTarget;
                    setOpen(i);
                  }}
                  aria-label={`Open ${media.alt || `${label} image ${i + 1}`}`}
                  className="group block w-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-burgundy"
                >
                  <NextImage
                    src={media.url}
                    alt={media.alt ?? ""}
                    width={media.width ?? 1200}
                    height={media.height ?? 900}
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw"
                    className="h-auto w-full transition-transform duration-500 ease-editorial motion-safe:group-hover:scale-[1.015]"
                  />
                </button>
                {media.caption && <figcaption className="type-small mt-3 text-muted">{media.caption}</figcaption>}
              </figure>
            </Reveal>
          </li>
        ))}
      </ul>
      {open !== null && <Lightbox images={images} index={open} onIndex={setOpen} onClose={close} />}
    </>
  );
}
