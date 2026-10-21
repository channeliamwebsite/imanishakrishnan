"use client";

import { useCallback, useRef, useState, type CSSProperties } from "react";
import NextImage from "next/image";
import type { MediaAsset, RecognitionItem } from "@/types/content";
import { Lightbox } from "@/components/testimonials/TestimonialGallery";
import { Reveal } from "@/components/ui/Reveal";

const altFor = (item: RecognitionItem, i: number) =>
  item.image.alt?.trim() || [item.title, item.organisation, item.year].filter(Boolean).join(" — ") || `Nisha Krishnan — award ${i + 1}`;

/** Shown in the lightbox only — the gallery itself carries no captions. */
const captionFor = (item: RecognitionItem) => [item.title, item.organisation, item.year].filter(Boolean).join(" · ") || undefined;

/**
 * Desktop frame proportions. A row's items share one height and split the width by these ratios,
 * so each row pairs a larger image with a smaller one, alternating sides.
 */
const WIDE = 1.55;
const NARROW = 1.05;
const EVEN = 1.3;

function galleryRows<T>(items: T[]): { item: T; ratio: number }[][] {
  const rows: { item: T; ratio: number }[][] = [];
  let i = 0;
  while (i < items.length) {
    const left = items.length - i;
    if (left === 3 || left === 1) {
      rows.push(items.slice(i).map((item) => ({ item, ratio: EVEN })));
      break;
    }
    const wideFirst = rows.length % 2 === 0;
    rows.push([
      { item: items[i], ratio: wideFirst ? WIDE : NARROW },
      { item: items[i + 1], ratio: wideFirst ? NARROW : WIDE },
    ]);
    i += 2;
  }
  return rows;
}

/**
 * The /awards gallery: the award images themselves, hung directly on the cream page — no panels,
 * borders or captions (the images are framed PNGs with transparent surroundings, so nothing is
 * added around them). Desktop: rows pairing a larger and a smaller image, alternating sides.
 * Tablet: two columns; phones: one, each at its natural proportions. Every image is shown whole
 * (object-contain) and opens the shared lightbox, which shows the award's title.
 */
export function AwardsShowcase({ items }: { items: RecognitionItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const close = useCallback(() => {
    setOpen(null);
    opener.current?.focus();
  }, []);
  const images: MediaAsset[] = items.map((item, i) => ({ ...item.image, alt: altFor(item, i), caption: captionFor(item) }));
  /** Opens the lightbox at the button's data-index and remembers the button for focus return. */
  const show = (e: React.MouseEvent<HTMLButtonElement>) => {
    opener.current = e.currentTarget;
    setOpen(Number(e.currentTarget.dataset.index));
  };
  const rows = galleryRows(items.map((item, index) => ({ item, index })));

  return (
    <>
      <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:flex lg:flex-col lg:gap-y-6">
        {rows.map((row, r) => (
          <div key={r} className="contents lg:flex lg:items-center lg:gap-10">
            {row.map(({ item: { item, index }, ratio }) => {
              const natural = (item.image.width ?? 4) / (item.image.height ?? 3);
              return (
                <div
                  key={item.image.publicId || index}
                  className="min-w-0 lg:basis-0 lg:grow-[var(--r)]"
                  style={{ "--r": ratio, "--n": natural } as CSSProperties}
                >
                  <Reveal delay={(index % 2) * 0.05}>
                    <button
                      type="button"
                      data-index={index}
                      onClick={show}
                      aria-label={`View larger: ${images[index].alt}`}
                      className="group relative block aspect-[var(--n)] w-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-burgundy lg:aspect-[var(--r)]"
                    >
                      <NextImage
                        src={item.image.url}
                        alt={images[index].alt!}
                        fill
                        preload={index === 0}
                        sizes={
                          ratio === WIDE
                            ? "(min-width: 1024px) 52vw, (min-width: 640px) 46vw, 100vw"
                            : "(min-width: 1024px) 36vw, (min-width: 640px) 46vw, 100vw"
                        }
                        className="object-contain transition-transform duration-700 ease-editorial motion-safe:group-hover:scale-[1.025]"
                      />
                    </button>
                  </Reveal>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {open !== null && <Lightbox images={images} index={open} onIndex={setOpen} onClose={close} />}
    </>
  );
}
