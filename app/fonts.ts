import { Cormorant_Garamond, Crimson_Pro, Montserrat } from "next/font/google";

/** Display serif — hero name, section headings, quote. High-contrast caps. */
export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

/** Text serif — body copy, descriptions, card titles. Cormorant is too light at reading sizes. */
export const crimson = Crimson_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-crimson",
  display: "swap",
});

/** Sans — navigation, labels, buttons, metadata. */
export const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-montserrat",
  display: "swap",
});
