"use client";

import { useCallback, useRef, useState, type CSSProperties } from "react";
import NextImage from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { MediaAsset, RecognitionItem } from "@/types/content";
import { cn } from "@/lib/cn";
import { Lightbox } from "@/components/testimonials/TestimonialGallery";
import { Reveal } from "@/components/ui/Reveal";

const altFor = (item: RecognitionItem, i: number) =>
  item.image.alt?.trim() || [item.title, item.organisation, item.year].filter(Boolean).join(" — ") || `Nisha Krishnan — award ${i + 1}`;

const metaFor = (item: RecognitionItem) => [item.organisation, item.year].filter(Boolean).join(" · ");

/**
 * Frame proportions for the editorial rows. On desktop a row's items share one height and split the
 * width in proportion to these ratios, so a "wide" item gets the larger visual area beside a
 * "narrow" one. The image always sits whole inside its frame (object-contain, padded) — never
 * stretched, and certificate text is never cropped.
 */
const WIDE = 1.5;
const NARROW = 1.05;
const EVEN = 4 / 3;

/** Splits the gallery into rows of 2 (alternating wide/narrow sides), finishing with a row of 3 or 1. */
function editorialRows<T>(items: T[]): { item: T; ratio: number }[][] {
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
 * The /awards page body: one featured recognition (the first image, as on /about) set beside its
 * details, then the rest in an asymmetric editorial grid — rows of two on desktop alternate a
 * larger and a smaller frame; two columns on tablets, one on phones. Every image opens the shared
 * lightbox (Escape closes, arrow keys move, focus returns).
 */
export function AwardsShowcase({ items }: { items: RecognitionItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const close = useCallback(() => {
    setOpen(null);
    opener.current?.focus();
  }, []);
  const images: MediaAsset[] = items.map((item, i) => ({ ...item.image, alt: altFor(item, i) }));
  /** Opens the lightbox at the button's data-index and remembers the button for focus return. */
  const show = (e: React.MouseEvent<HTMLButtonElement>) => {
    opener.current = e.currentTarget;
    setOpen(Number(e.currentTarget.dataset.index));
  };

  const [featured, ...rest] = items;
  const rows = editorialRows(rest.map((item, i) => ({ item, index: i + 1 })));

  return (
    <>
      {/* ── Featured recognition ── */}
      {featured && (
        <Reveal className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <button
            type="button"
            data-index={0}
            onClick={show}
            aria-label={`View larger: ${images[0].alt}`}
            className="group block lg:col-span-7 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-burgundy"
          >
            <span className="block border hairline bg-white/60 p-4 shadow-[0_1px_0_rgba(0,0,0,0.02)] sm:p-7">
              <NextImage
                src={featured.image.url}
                alt={images[0].alt!}
                width={featured.image.width ?? 1600}
                height={featured.image.height ?? 1200}
                sizes="(min-width: 1024px) 54vw, 100vw"
                preload
                className="h-auto max-h-[34rem] w-full object-contain transition-transform duration-700 ease-editorial motion-safe:group-hover:scale-[1.015]"
              />
            </span>
          </button>
          <div className="lg:col-span-5">
            <p className="type-label flex items-center gap-4 text-rose">
              Featured Recognition
              <span aria-hidden className="block h-px w-10 bg-rose/50" />
            </p>
            {featured.category && <p className="type-meta mt-5 text-muted">{featured.category}</p>}
            {featured.title && <h2 className="type-h2 mt-4 text-foreground">{featured.title}</h2>}
            {metaFor(featured) && <p className="type-meta mt-3 text-burgundy">{metaFor(featured)}</p>}
            <span aria-hidden className="mt-6 block h-0.5 w-12 bg-burgundy" />
            {featured.description && <p className="type-body mt-6 max-w-[34rem] text-foreground/80">{featured.description}</p>}
            <button
              type="button"
              data-index={0}
              onClick={show}
              className="type-button group mt-8 inline-flex items-center gap-2 text-burgundy transition-colors hover:text-foreground"
            >
              View certificate
              <ArrowUpRight className="size-3.5 transition-transform duration-300 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5" aria-hidden />
            </button>
          </div>
        </Reveal>
      )}

      {/* ── The gallery: rows on desktop, a grid below ── */}
      {rows.length > 0 && (
        <div className={cn("grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:flex lg:flex-col lg:gap-y-20", featured && "mt-section border-t hairline pt-section lg:mt-24 lg:pt-20")}>
          {rows.map((row, r) => (
            <div key={r} className="contents lg:flex lg:items-start lg:gap-12">
              {row.map(({ item: { item, index }, ratio }) => {
                const meta = metaFor(item);
                return (
                  <div
                    key={item.image.publicId || index}
                    className="min-w-0 lg:basis-0 lg:grow-[var(--r)]"
                    style={{ "--r": ratio } as CSSProperties}
                  >
                    <Reveal delay={Math.min(r % 2, 1) * 0.04}>
                      <figure className="group">
                        <button
                          type="button"
                          data-index={index}
                          onClick={show}
                          aria-label={`View larger: ${images[index].alt}`}
                          className="relative block aspect-[4/3] w-full border hairline bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-burgundy lg:aspect-[var(--r)]"
                        >
                          <span className="absolute inset-3 sm:inset-5">
                            <NextImage
                              src={item.image.url}
                              alt={images[index].alt!}
                              fill
                              sizes={ratio === WIDE ? "(min-width: 1024px) 50vw, (min-width: 640px) 46vw, 100vw" : "(min-width: 1024px) 36vw, (min-width: 640px) 46vw, 100vw"}
                              className="object-contain transition-transform duration-700 ease-editorial motion-safe:group-hover:scale-[1.02]"
                            />
                          </span>
                        </button>
                        <figcaption className="mt-5 max-w-[34rem]">
                          {item.category && <p className="type-meta mb-1.5 text-rose">{item.category}</p>}
                          {item.title && (
                            <p className="type-h4 text-foreground transition-colors duration-300 group-hover:text-burgundy">{item.title}</p>
                          )}
                          {meta && <p className="type-meta mt-1.5 text-muted">{meta}</p>}
                          {item.description && <p className="type-small mt-2.5 line-clamp-3 text-foreground/70">{item.description}</p>}
                        </figcaption>
                      </figure>
                    </Reveal>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {open !== null && <Lightbox images={images} index={open} onIndex={setOpen} onClose={close} />}
    </>
  );
}
