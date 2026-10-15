"use client";

import { useCallback, useRef, useState } from "react";
import NextImage from "next/image";
import type { MediaAsset, RecognitionItem } from "@/types/content";
import { Lightbox } from "@/components/testimonials/TestimonialGallery";
import { Reveal } from "@/components/ui/Reveal";

const altFor = (item: RecognitionItem, i: number, total: number) =>
  item.image.alt?.trim() ||
  [item.title, item.organisation, item.year].filter(Boolean).join(" — ") ||
  `Nisha Krishnan — award and recognition, image ${i + 1} of ${total}`;

/**
 * The /awards gallery: the /about Recognition images (about/main → profile.achievements.gallery),
 * each shown whole at its natural proportions (certificates are never cropped) in a masonry-style
 * column layout — 1 column on phones, 2 on tablets, 3 on desktop — like the news gallery. Captions
 * show only the fields the editor filled in. Clicking opens the shared lightbox.
 */
export function AwardsGallery({ items }: { items: RecognitionItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const close = useCallback(() => {
    setOpen(null);
    opener.current?.focus();
  }, []);
  const images: MediaAsset[] = items.map((item, i) => ({ ...item.image, alt: altFor(item, i, items.length) }));

  return (
    <>
      <ul className="gap-x-8 sm:columns-2 lg:columns-3">
        {items.map((item, i) => {
          const alt = altFor(item, i, items.length);
          const meta = [item.organisation, item.year].filter(Boolean).join(" · ");
          return (
            <li key={item.image.publicId || i} className="mb-10 break-inside-avoid">
              <Reveal delay={Math.min(i % 3, 2) * 0.06}>
                <figure>
                  <button
                    type="button"
                    onClick={(e) => {
                      opener.current = e.currentTarget;
                      setOpen(i);
                    }}
                    aria-label={`Open ${alt}`}
                    className="group block w-full overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-burgundy"
                  >
                    <NextImage
                      src={item.image.url}
                      alt={alt}
                      width={item.image.width ?? 1200}
                      height={item.image.height ?? 1200}
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw"
                      className="h-auto w-full transition-transform duration-500 ease-editorial motion-safe:group-hover:scale-[1.01]"
                    />
                  </button>
                  {(item.title || meta) && (
                    <figcaption className="mt-4 border-t hairline pt-3">
                      {item.title && <p className="type-h4 text-foreground">{item.title}</p>}
                      {meta && <p className="type-meta mt-1 text-muted">{meta}</p>}
                    </figcaption>
                  )}
                </figure>
              </Reveal>
            </li>
          );
        })}
      </ul>
      {open !== null && <Lightbox images={images} index={open} onIndex={setOpen} onClose={close} />}
    </>
  );
}
