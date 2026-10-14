"use client";

import { useCallback, useRef, useState } from "react";
import NextImage from "next/image";
import type { MediaAsset, NewsClipping } from "@/types/content";
import { Lightbox } from "@/components/testimonials/TestimonialGallery";
import { Reveal } from "@/components/ui/Reveal";

const altFor = (n: NewsClipping, i: number) =>
  n.image.alt?.trim() || [n.publication, n.headline].filter(Boolean).join(" — ") || `News clipping ${i + 1}`;

/**
 * Newspaper clippings and press coverage on /about. Each clipping is shown whole at its natural
 * proportions (never cropped), without a card or border, in a masonry-style column layout:
 * 1 column on phones, 2 on tablets, 3 on desktop. Clicking opens the shared lightbox.
 */
export function NewsGallery({ items }: { items: NewsClipping[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const close = useCallback(() => {
    setOpen(null);
    opener.current?.focus();
  }, []);
  const images: MediaAsset[] = items.map((n, i) => ({ ...n.image, alt: altFor(n, i) }));

  return (
    <>
      <ul className="gap-x-8 sm:columns-2 lg:columns-3">
        {items.map((n, i) => (
          <li key={n.image.publicId || i} className="mb-10 break-inside-avoid">
            <Reveal delay={Math.min(i % 3, 2) * 0.06}>
              <figure>
                <button
                  type="button"
                  onClick={(e) => {
                    opener.current = e.currentTarget;
                    setOpen(i);
                  }}
                  aria-label={`Open ${altFor(n, i)}`}
                  className="group block w-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-burgundy"
                >
                  <NextImage
                    src={n.image.url}
                    alt={altFor(n, i)}
                    width={n.image.width ?? 1200}
                    height={n.image.height ?? 1500}
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw"
                    className="h-auto w-full transition-transform duration-500 ease-editorial motion-safe:group-hover:scale-[1.01]"
                  />
                </button>
                {(n.publication || n.headline || n.date) && (
                  <figcaption className="mt-4 border-t hairline pt-3">
                    {n.publication && <p className="type-caps text-rose">{n.publication}</p>}
                    {n.headline && <p className="type-h4 mt-1.5 text-foreground">{n.headline}</p>}
                    {n.date && <p className="type-meta mt-1.5 text-muted">{n.date}</p>}
                  </figcaption>
                )}
              </figure>
            </Reveal>
          </li>
        ))}
      </ul>
      {open !== null && <Lightbox images={images} index={open} onIndex={setOpen} onClose={close} />}
    </>
  );
}
