"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

/**
 * A vertical rule that draws itself downward (scaleY) when it enters the viewport.
 * Shares Reveal's `data-reveal` fallback: with reduced motion or without JavaScript the
 * line is simply shown in full (app/globals.css, app/layout.tsx).
 */
export function RevealLine({ className, delay = 0 }: { className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      aria-hidden
      data-reveal=""
      className={cn("block origin-top", className)}
      initial={{ scaleY: 0 }}
      whileInView={{ scaleY: 1 }}
      viewport={{ once: true, margin: "0px 0px -15% 0px" }}
      transition={reduce ? { duration: 0 } : { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}
