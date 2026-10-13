import { Cormorant_Garamond, Crimson_Pro } from "next/font/google";

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
 * Functional face — navigation, numbers and years, statistic labels, buttons, metadata,
 * footer links, form controls. Exposed as --font-sans in app/globals.css.
 */
export const crimson = Crimson_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-crimson",
  display: "swap",
});
