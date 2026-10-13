"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import NextImage from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { MediaAsset } from "@/types/content";
import { cn } from "@/lib/cn";

/** Beyond this many pages, dots become a "03 / 21" counter with a progress line. */
const MAX_DOTS = 10;

const altText = (image: MediaAsset, index: number) => image.alt?.trim() || `Testimonial ${index + 1}`;

const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Horizontal testimonial carousel: two square images per view from tablet up, one on phones.
 * Native scroll-snap (touch swipe for free), circular arrows either side that never overlap the
 * images, and pagination beneath. Arrow keys work when the track is focused. No autoplay.
 */
export function TestimonialCarousel({ images, label }: { images: MediaAsset[]; label: string }) {
  const track = useRef<HTMLUListElement>(null);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);

  /** Page width = one view (the track's width) plus the gap that follows it. */
  const pageWidth = useCallback(() => {
    const el = track.current;
    if (!el) return 1;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    return el.clientWidth + gap;
  }, []);

  const measure = useCallback(() => {
    const el = track.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return;
    const perView = Math.max(1, Math.round(el.clientWidth / first.offsetWidth));
    const total = Math.ceil(images.length / perView);
    setPages(total);
    // At the very end the last page may be partial: treat "scrolled to the end" as the last page.
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    setPage(atEnd ? total - 1 : Math.min(total - 1, Math.round(el.scrollLeft / pageWidth())));
  }, [images.length, pageWidth]);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    el.addEventListener("scroll", measure, { passive: true });
    // Fires once on observe (initial state), and again whenever the track or slide size changes.
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    measure(); // initial state, without waiting for the observer's first callback

    return () => {
      el.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, [measure]);

  const goTo = (target: number) => {
    const el = track.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(pages - 1, target));
    // Update the indicator now — repeated clicks advance during the smooth scroll; scroll events re-sync after swipes.
    setPage(clamped);
    el.scrollTo({ left: clamped * pageWidth(), behavior: reduceMotion() ? "auto" : "smooth" });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(page + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(page - 1);
    }
  };

  const canPrev = page > 0;
  const canNext = page < pages - 1;
  const arrow =
    "grid size-11 shrink-0 place-items-center rounded-full border border-rose/50 text-burgundy transition-colors duration-300 hover:border-burgundy hover:bg-burgundy hover:text-white disabled:pointer-events-none disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy md:size-12";
  const prevButton = (className?: string) => (
    <button type="button" onClick={() => goTo(page - 1)} disabled={!canPrev} aria-label="Previous testimonials" className={cn(arrow, className)}>
      <ArrowLeft className="size-4" aria-hidden />
    </button>
  );
  const nextButton = (className?: string) => (
    <button type="button" onClick={() => goTo(page + 1)} disabled={!canNext} aria-label="Next testimonials" className={cn(arrow, className)}>
      <ArrowRight className="size-4" aria-hidden />
    </button>
  );

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label}>
      <div className="flex items-center gap-4 lg:gap-8">
        {prevButton("hidden md:grid")}
        <ul
          ref={track}
          tabIndex={0}
          onKeyDown={onKeyDown}
          aria-label={`${label} — use the arrow keys to move`}
          className="scroll-track flex min-w-0 flex-1 gap-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-burgundy md:gap-6"
        >
          {images.map((image, i) => (
            <li
              key={image.publicId || i}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${images.length}`}
              className="w-full shrink-0 md:w-[calc((100%-1.5rem)/2)]"
            >
              {/* No border or fill: the testimonial PNGs are transparent around their frame, so they sit on the section's cream. */}
              <figure className="relative aspect-square w-full overflow-hidden">
                <NextImage
                  src={image.url}
                  alt={altText(image, i)}
                  fill
                  sizes="(min-width: 1360px) 560px, (min-width: 768px) 42vw, 90vw"
                  className="object-contain"
                />
              </figure>
            </li>
          ))}
        </ul>
        {nextButton("hidden md:grid")}
      </div>

      {/* Pagination — and, on phones, the arrows beside it. */}
      <div className="mt-8 flex items-center justify-center gap-5">
        {prevButton("md:hidden")}
        {pages > 1 &&
          (pages <= MAX_DOTS ? (
            <div className="flex items-center gap-2.5">
              {Array.from({ length: pages }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Go to page ${i + 1} of ${pages}`}
                  aria-current={i === page ? "true" : undefined}
                  className="grid size-6 place-items-center focus-visible:outline-2 focus-visible:outline-burgundy"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "block h-1.5 rounded-full transition-all duration-300",
                      i === page ? "w-6 bg-burgundy" : "w-1.5 bg-rose/40",
                    )}
                  />
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3" aria-live="polite">
              <span className="type-meta tabular-nums text-burgundy">{String(page + 1).padStart(2, "0")}</span>
              <span aria-hidden className="relative block h-px w-24 bg-rose/30 sm:w-32">
                <span
                  className="absolute inset-y-0 left-0 bg-burgundy transition-[width] duration-300"
                  style={{ width: `${((page + 1) / pages) * 100}%` }}
                />
              </span>
              <span className="type-meta tabular-nums text-muted">{String(pages).padStart(2, "0")}</span>
              <span className="sr-only">
                Page {page + 1} of {pages}
              </span>
            </div>
          ))}
        {nextButton("md:hidden")}
      </div>
    </div>
  );
}
