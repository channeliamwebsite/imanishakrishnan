import { Cormorant_Garamond, Crimson_Pro, Montserrat, Oswald } from "next/font/google";

/**
 * Editorial face — brand, headings, timeline and card titles, body copy, philosophy.
 * Exposed as --font-display (and --font-serif) in app/globals.css.
 */
export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

/**
 * Functional face — statistic labels, buttons, metadata, footer links, form controls.
 * Exposed as --font-sans in app/globals.css.
 */
export const crimson = Crimson_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-crimson",
  display: "swap",
});

/** Navigation labels — uppercase, tracked. Exposed as --font-ui (type-nav). Only the weights used. */
export const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-montserrat",
  display: "swap",
});

/** Statistics, years and numbered markers. Exposed as --font-figure (type-figure). */
export const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-oswald",
  display: "swap",
});
