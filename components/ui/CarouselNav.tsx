"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Prev/next circle buttons that scroll a `.scroll-track` element by one viewport of cards.
 * When every item already fits (e.g. 4 cards on desktop) both buttons are disabled.
 */
export function CarouselNav({ targetId, className }: { targetId: string; className?: string }) {
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = document.getElementById(targetId);
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, [targetId]);

  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    // Fires once on observe, which sets the initial state.
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [targetId, update]);

  const scroll = (direction: 1 | -1) => {
    const el = document.getElementById(targetId);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el?.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: reduce ? "auto" : "smooth" });
  };

  const button =
    "grid size-12 place-items-center rounded-full border border-rose/50 text-foreground transition-colors duration-300 hover:border-burgundy hover:bg-burgundy hover:text-white disabled:pointer-events-none disabled:text-foreground/45";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <button type="button" className={button} onClick={() => scroll(-1)} disabled={!canPrev} aria-label="Previous" aria-controls={targetId}>
        <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden />
      </button>
      <button type="button" className={button} onClick={() => scroll(1)} disabled={!canNext} aria-label="Next" aria-controls={targetId}>
        <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden />
      </button>
    </div>
  );
}
