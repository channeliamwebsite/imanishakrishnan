/**
 * Content models for every CMS-editable part of the site.
 *
 * Each interface maps 1:1 to a Firestore collection (see lib/firebase/collections.ts).
 * Media is never stored in Firestore — only the Cloudinary reference (MediaAsset).
 */

/* ------------------------------------------------------------------ */
/* Shared primitives                                                   */
/* ------------------------------------------------------------------ */

/**
 * A Cloudinary-hosted image or video — the single media type used by every collection.
 * Firestore stores this object, never the file:
 *   url       Cloudinary secure_url (https://res.cloudinary.com/<cloud>/image/upload/…)
 *   publicId  Cloudinary public_id (e.g. "nisha-krishnan/hero/portrait"), used to manage the asset
 *   width/height  original pixel size when known; alt  accessible description
 */
export interface MediaAsset {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  alt?: string;
  resourceType?: "image" | "video";
}

export interface Link {
  label: string;
  href: string;
}

/** Fields shared by every ordered, publishable list item. */
export interface ListItemBase {
  id: string;
  order: number;
  published: boolean;
}

/** Icon keys resolved by components/ui/Icon.tsx. Stored as plain strings in Firestore. */
export type IconName =
  | "mic"
  | "building"
  | "globe"
  | "users"
  | "sparkles"
  | "newspaper"
  | "award"
  | "trending"
  | "chart"
  | "lightbulb";

export type SocialPlatform = "linkedin" | "x" | "instagram" | "youtube" | "facebook" | "email";

/* ------------------------------------------------------------------ */
/* Singleton documents  (collection/{SINGLETON_DOC_ID})                */
/* ------------------------------------------------------------------ */

/**
 * hero/main — stored exactly as editors write it; the Hero component derives the
 * display pieces (eyebrow words, "I'm" + name lines, location lines) from these strings.
 */
export interface HeroContent {
  eyebrow: string; // "IDEAS | PEOPLE | IMPACT" — split on "|"
  name: string; // "I'm Nisha Krishnan" — a leading "I'm" is set small/italic
  designation: string; // "Founder & CEO"
  roles: string[]; // ["Journalist", "Media Entrepreneur"] — shown after the designation
  description: string;
  primaryCta: { label: string; link: string };
  secondaryCta?: { label: string; url?: string };
  location: string; // "KOCHI / INDIA" — split on "/" into lines
  image?: MediaAsset;
}

/** about/main — Cloudinary: nisha-krishnan/profile */
export interface AboutContent {
  label: string; // "BEHIND THE JOURNEY"
  heading: string; // "A journey built on stories."
  /** Short lead line under the heading. */
  intro?: string;
  paragraphs: string[];
  /** Closing line after the story timeline (site copy, not an attributed quote). */
  closing?: string;
  cta: Link;
  images: MediaAsset[]; // collage: [0] wide primary (8:5), [1] secondary (14:15)
  keywords?: string[]; // small caps list beside the secondary image
}

/** philosophy/main */
export interface PhilosophyContent {
  quote: string;
  supportingText: string;
  author: string;
  image: MediaAsset;
}

/** siteSettings/main */
export interface SiteSettings {
  siteName: string;
  roles: string[];
  navigation: Link[];
  connectCta: Link;
  footer: FooterContent;
  seo: SeoContent;
  sections: SectionCopy;
}

export interface FooterContent {
  description: string;
  quickLinksTitle: string;
  connectTitle: string;
  connectText: string;
  contactEmail: string;
  newsletterPlaceholder: string;
  copyright: string;
  legalLinks: Link[];
}

export interface SeoContent {
  title: string;
  titleTemplate: string;
  description: string;
  keywords: string[];
  siteUrl: string;
  ogImage?: MediaAsset;
}

/** Headings / intro copy for list sections, so nothing on the page is hard-coded. */
export interface SectionCopy {
  work: { label?: string; heading: string; cta?: Link };
  media: { label?: string; heading: string; tagline?: string };
  insights: { label?: string; heading: string; intro: string; cta?: Link };
}

/* ------------------------------------------------------------------ */
/* List collections                                                    */
/* ------------------------------------------------------------------ */

/** statistics/{id} — only `active: true` documents are shown, sorted by `order` ascending. */
export interface ImpactStatistic {
  id?: string;
  value: string; // "23+"
  title: string; // "YEARS IN MEDIA"
  description?: string;
  order: number;
  active: boolean;
  /** Optional line icon; when omitted the component assigns one by position. */
  icon?: IconName;
}

/** timeline/{id} — rendered as the About section's story timeline, in `order`. */
export interface TimelineEntry extends ListItemBase {
  year: string; // marker: "2016", "15,000+", "Next"
  title: string;
  description?: string;
  /**
   * milestone (default): dated achievement · figure: a key number · vision: a forward-looking
   * ambition, styled distinctly so it is never read as a completed achievement.
   */
  kind?: "milestone" | "figure" | "vision";
  image?: MediaAsset; // Cloudinary: nisha-krishnan/timeline
}

/** work/{id} — Cloudinary: nisha-krishnan/work/<channeliam|she-power|startup-studio|advisory> */
export interface WorkItem extends ListItemBase {
  /** Brand logo shown in the card's logo area. Without one, icon + category + tagline are shown. */
  logo?: MediaAsset;
  icon?: IconName;
  tagline?: string;
  coverImage?: MediaAsset; // card image, displayed 7:3
  gallery?: MediaAsset[]; // for a future detail page
  category: string;
  title: string;
  description: string;
  cta: Link;
}

/** achievements/{id} — Cloudinary: nisha-krishnan/achievements. Not rendered yet. */
export interface Achievement extends ListItemBase {
  title: string;
  year?: string;
  issuer?: string;
  description?: string;
  image?: MediaAsset;
  certificate?: MediaAsset;
}

/** mediaFeatures/{id} — Cloudinary: nisha-krishnan/media */
export interface MediaFeature extends ListItemBase {
  publication: string;
  logo?: MediaAsset;
  articleUrl?: string;
}

/** insights/{id} — Cloudinary: nisha-krishnan/insights */
export interface Insight extends ListItemBase {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  coverImage?: MediaAsset; // displayed 13:5
  publishedAt: string; // ISO date — converted from Firestore Timestamp in the data layer
  featured: boolean;
  body?: string;
}

/** speaking/{id} — Cloudinary: nisha-krishnan/speaking. Not rendered yet. */
export interface SpeakingEvent extends ListItemBase {
  title: string;
  event: string;
  location: string;
  date: string; // ISO date
  image?: MediaAsset;
  gallery?: MediaAsset[];
  url?: string;
}

/** testimonials/{id} — Cloudinary: nisha-krishnan/testimonials. Not rendered yet. */
export interface Testimonial extends ListItemBase {
  quote: string;
  name: string;
  role: string;
  organisation?: string;
  avatar?: MediaAsset;
}

/** socialLinks/{id} */
export interface SocialLink extends ListItemBase {
  platform: SocialPlatform;
  url: string;
  label: string;
}

/* ------------------------------------------------------------------ */
/* Aggregates                                                          */
/* ------------------------------------------------------------------ */

export interface HomeContent {
  hero: HeroContent;
  statistics: ImpactStatistic[];
  about: AboutContent;
  timeline: TimelineEntry[];
  work: WorkItem[];
  mediaFeatures: MediaFeature[];
  philosophy: PhilosophyContent;
  insights: Insight[];
}
