"use client";

import { useEffect } from "react";

/** How long after load late layout changes (fonts, images, reveals) may still move the target. */
const SETTLE_MS = 3000;

/**
 * Direct visits to a homepage section (/#about, /#impact…): the browser jumps to the anchor while
 * the page is still settling — before hydration, web fonts and images — so later layout changes
 * can push the section off target. This re-applies the jump instantly after hydration and whenever
 * the page's size changes during the first few seconds, and stops as soon as the visitor scrolls
 * or interacts. The fixed header is accounted for by
 * html { scroll-padding-top: var(--nav-height) } (globals.css).
 */
export function HashScroll() {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id || !document.getElementById(id)) return;

    let done = false;
    const go = () => {
      if (!done) document.getElementById(id)?.scrollIntoView({ behavior: "instant", block: "start" });
    };
    const observer = new ResizeObserver(go);
    const userInput = ["wheel", "touchstart", "keydown", "mousedown"] as const;
    const stop = () => {
      done = true;
      observer.disconnect();
      userInput.forEach((type) => window.removeEventListener(type, stop));
    };

    userInput.forEach((type) => window.addEventListener(type, stop, { passive: true }));
    observer.observe(document.body);
    go();
    const timer = window.setTimeout(stop, SETTLE_MS);

    return () => {
      window.clearTimeout(timer);
      stop();
    };
  }, []);
  return null;
}
