"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import type { MediaAsset } from "@/types/content";
import { Lightbox } from "@/components/testimonials/TestimonialGallery";

/**
 * A publication logo/name that opens a screenshot of the coverage in the shared image viewer
 * (close button, Escape, focus returns here) — used when the original article is no longer online.
 */
export function MediaScreenshot({ screenshot, publication, children }: { screenshot: MediaAsset; publication: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => {
    setOpen(false);
    button.current?.focus();
  }, []);
  const image: MediaAsset = {
    ...screenshot,
    alt: screenshot.alt || `${publication} — coverage of Nisha Krishnan`,
    caption: screenshot.caption || publication,
  };

  return (
    <>
      <button
        ref={button}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`View ${publication} coverage`}
        aria-haspopup="dialog"
        className="block cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-burgundy"
      >
        {children}
      </button>
      {open && <Lightbox images={[image]} index={0} onIndex={() => {}} onClose={close} />}
    </>
  );
}
