"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Subtle fade-up on scroll — the site's single scroll-animation primitive.
 *
 * - The initial state is identical on server and client, so hydration matches.
 * - Animates opacity/transform only, once per element.
 * - `data-reveal` lets CSS show content immediately when the visitor prefers reduced motion
 *   (app/globals.css) or has JavaScript disabled (noscript rule in app/layout.tsx), so
 *   content never depends on this animation to become visible.
 */
export function Reveal({
  children,
  delay = 0,
  y = 16,
  duration = 0.7,
  className,
}: {
  children: ReactNode;
  delay?: number;
  /** Upward travel in px; 0 for a pure fade. */
  y?: number;
  duration?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      data-reveal=""
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={reduce ? { duration: 0 } : { duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
