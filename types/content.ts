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
  /**
   * Set when the image was cropped in the CMS: the uncropped source, so the crop can be changed
   * or reset. `url`, `width` and `height` then describe the cropped result (a Cloudinary c_crop
   * transformation of the same publicId — the uploaded file itself is never changed).
   */
  original?: { url: string; width?: number; height?: number };
  /** Optional caption shown under the image where the design has one (e.g. work galleries). */
  caption?: string;
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
  | "lightbulb"
  | "megaphone"
  | "video"
  | "message"
  | "trophy";

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
  /** "Journalist. Media Entrepreneur. Ecosystem Builder." — shown under the name (replaces the role line). */
  identity?: string;
  /** Brand line under the identity, e.g. "From telling stories of change to building ecosystems of growth." */
  tagline?: string;
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
  /** Long-form profile rendered on the /about page (detailed bio, achievements, expertise, philosophy). */
  profile?: ProfileContent;
}

/** A titled item with a short description (achievements, expertise areas). */
export interface ProfileItem {
  title: string;
  description: string;
  /** Extra paragraphs (expertise areas). */
  details?: string[];
  /** "Core strengths" line (expertise areas). */
  strengths?: string;
  /** In-page anchor id. */
  anchor?: string;
  /** Small line icon (areas of expertise). */
  icon?: IconName;
  /** Hidden from the site when false (default shown). */
  published?: boolean;
}

/** One newspaper clipping or press-coverage image in the /about "News & Media Recognition" gallery. */
export interface NewsClipping {
  image: MediaAsset;
  /** Newspaper or publication name. */
  publication?: string;
  /** Optional headline or short description. */
  headline?: string;
  /** Optional publication date, as entered (e.g. "12 March 2019"). */
  date?: string;
  /** Hidden from the site when false. */
  published?: boolean;
}

/**
 * One image in the /about Recognition gallery — a newspaper cutting, award photo, plaque or
 * certificate. Shown whole (object-contain); captions only from what the editor enters.
 */
export interface RecognitionItem {
  image: MediaAsset;
  /** Publication or award name, e.g. "The Hindu" or "Kerala State Media Award". */
  title?: string;
  organisation?: string;
  year?: string;
  category?: string;
  description?: string;
  /** Hidden from the site when false. */
  published?: boolean;
}

export interface ProfileContent {
  /** "Award-Winning Journalist | Media Entrepreneur | …" */
  tagline: string;
  detailedBio: string[];
  achievements: {
    heading: string;
    tagline?: string;
    groups: { heading: string; items: ProfileItem[] }[];
    /** Newspaper cuttings, award photos and certificates, in display order (first = featured). */
    gallery?: RecognitionItem[];
  };
  expertise: {
    heading: string;
    subtitle: string;
    intro: string[];
    items: ProfileItem[];
    distinctiveStrength: { heading: string; paragraphs: string[] };
  };
  philosophy: {
    heading: string;
    subtitle: string;
    paragraphs: string[];
    image?: MediaAsset;
    /** Approved quotation for the burgundy panel; the highlighted line is used when empty. */
    quote?: string;
  };
  /** /about introduction: portrait beside the name and opening biography. */
  intro?: { image?: MediaAsset; quote?: string };
  /** /about "My Story": photograph beside the biography. */
  storyImage?: MediaAsset;
  /** /about "News & Media Recognition": newspaper clippings and press coverage, in display order. */
  news?: { label?: string; heading: string; intro?: string; items?: NewsClipping[] };
  /** Fixed labels and headings of the /about page. Defaults in lib/content/profile.ts. */
  page?: ProfilePageCopy;
}

export interface ProfilePageCopy {
  eyebrow: string; // "Profile"
  title: string; // page heading — "Nisha Krishnan"
  metaDescription: string;
  biographyLabel: string;
  biographyHeading: string;
  milestonesLabel: string;
  milestonesHeading: string;
  milestonesIntro?: string;
  recognitionLabel: string;
  leadershipLabel: string;
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
  // connectText: string;
  /** Optional — rendered only when supplied. */
  contactEmail?: string;
  /** Newsletter field placeholder — the form is shown only when a submission endpoint exists. */
  newsletterPlaceholder?: string;
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

/** Fixed labels of the work detail pages (/work/{slug}). */
export interface WorkDetailCopy {
  backLabel: string; // link back to the homepage section
  aboutLabel: string; // label above the detail paragraphs
  highlightsLabel: string;
  workLabel: string; // label above the area-of-expertise text
  strengthsLabel: string;
  milestonesLabel: string;
  galleryLabel: string;
}

export interface TestimonialsCopy {
  label?: string;
  heading: string;
  intro?: string;
  /** Testimonial images in display order (Cloudinary: nisha-krishnan/testimonials). */
  images?: MediaAsset[];
  /** "View all testimonials" link under the homepage carousel. */
  cta?: Link;
}

/** Headings / intro copy for list sections, so nothing on the page is hard-coded. */
export interface SectionCopy {
  work: { label?: string; heading: string; cta?: Link; detail?: WorkDetailCopy };
  media: { label?: string; heading: string; tagline?: string };
  /** Awards & Honours strip (achievements collection). */
  awards?: { label?: string; heading: string; tagline?: string };
  /**
   * Testimonials (homepage section and /testimonials). Optional so settings published before it
   * existed stay valid. The testimonials are images — each already contains its text.
   */
  testimonials?: TestimonialsCopy;
  insights: {
    label?: string;
    heading: string;
    intro: string;
    cta?: Link;
    /** Shown when no article is published yet. */
    emptyText?: string;
  };
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
  /** Built-in line icon; when omitted the component assigns one by position. */
  icon?: IconName;
  /** Uploaded icon (Cloudinary) — replaces the built-in icon when set. */
  iconImage?: MediaAsset;
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
  coverImage?: MediaAsset; // card image, displayed 7:3; also the detail page's featured image
  gallery?: MediaAsset[]; // the detail page's image gallery
  category: string;
  title: string;
  /** Short description — the card text and the detail page's introduction. */
  description: string;
  /** Card link. When `slug` is set the card always opens the detail page; `cta.href` is the fallback. */
  cta: Link;
  /** URL segment of the detail page (/work/{slug}), e.g. "channeliam". Without it there is no detail page. */
  slug?: string;
  detail?: WorkDetail;
}

/**
 * Long-form content of a work item's detail page (/work/{slug}). Besides its own paragraphs, the
 * page can show an area of expertise (about/main → profile.expertise) and timeline entries by
 * reference, so those facts live in one place and /about and the detail page always agree.
 */
export interface WorkDetail {
  /** Page heading when it should differ from the card title, e.g. "Channeliam". */
  title?: string;
  /** Introduction under the heading (the card description is used when empty). */
  intro?: string;
  /** Client or organisation, e.g. "U.S. Department of State". */
  organisation?: string;
  /** Date or period, e.g. "2020–2021". */
  period?: string;
  /** Search and social sharing; falls back to the title and introduction. */
  seo?: { title?: string; description?: string };
  /** Heading of the "About" block, e.g. "About Channeliam". */
  aboutHeading?: string;
  /** Detailed paragraphs about the initiative. */
  paragraphs?: string[];
  /** Area of expertise (by its `anchor`) whose description, paragraphs and core strengths are shown. */
  expertiseAnchor?: string;
  /** Timeline entry ids shown as milestones, in this order. */
  milestoneIds?: string[];
  /** Key figures, e.g. { value: "15,000+", label: "Business stories" }. */
  highlights?: { value: string; label: string }[];
  /** Main call to action. Only verified destinations: internal routes or official sites. */
  cta?: Link;
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

/**
 * insights/{id} — blog articles. Cloudinary: nisha-krishnan/insights. Only documents with
 * `published: true` are readable by the public (firestore.rules); unpublished edits live in
 * insightDrafts/{id}.
 */
export interface Insight extends ListItemBase {
  slug: string;
  title: string;
  excerpt: string;
  /** Primary category, shown on cards. */
  category: string;
  /** Further categories (the primary one is not repeated). */
  categories?: string[];
  tags?: string[];
  author?: string;
  coverImage?: MediaAsset; // featured image, displayed 13:5
  publishedAt: string; // ISO date — converted from Firestore Timestamp in the data layer
  updatedAt?: string;
  createdAt?: string;
  featured: boolean;
  /** Article body as HTML from the admin's rich-text editor. Sanitised again on render. */
  body?: string;
  seo?: { title?: string; description?: string; image?: MediaAsset };
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
  role: string; // designation
  organisation?: string; // company
  avatar?: MediaAsset; // portrait
  logo?: MediaAsset; // optional company logo
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

/* ------------------------------------------------------------------ */
/* Media & Press, Video Gallery, Ecosystem Enabler, Avatar video        */
/* ------------------------------------------------------------------ */

export type PressCategory = "newspaper" | "magazine" | "online" | "interview" | "feature" | "other";

/** press/{id} — a newspaper clipping or press feature. Cloudinary: nisha-krishnan/media */
export interface PressArticle extends ListItemBase {
  headline: string;
  publication: string;
  date?: string; // ISO date
  category: PressCategory;
  description?: string;
  /** Clipping images, first = cover. At least one. */
  images: MediaAsset[];
  url?: string;
  featured: boolean;
}

export type VideoCategory = "talk" | "interview" | "panel" | "event" | "short";
export type EditorialCategory = "editorial" | "business" | "entrepreneurship" | "leadership" | "innovation" | "interview";

/** videos/{id} and ecosystemVideos/{id} — a YouTube video (never uploaded; only the URL and id are stored). */
export interface VideoItem extends ListItemBase {
  youtubeUrl: string;
  /** Validated 11-character YouTube id, extracted from youtubeUrl when published. */
  videoId: string;
  title: string;
  description?: string;
  /** VideoCategory (Video Gallery, Ecosystem) or EditorialCategory (Editorial Insights). */
  category: VideoCategory | EditorialCategory;
  date?: string; // ISO date
  duration?: string;
  /** Optional uploaded thumbnail; otherwise the YouTube thumbnail is used. */
  thumbnail?: MediaAsset;
  featured: boolean;
}

/** ecosystemEvents/{id} — a summit, conference or gathering. Cloudinary: nisha-krishnan/speaking */
export interface EcosystemEvent extends ListItemBase {
  name: string;
  summit?: string;
  date?: string; // ISO date
  location?: string;
  role?: string;
  description?: string;
  category: string;
  images: MediaAsset[];
  url?: string;
  featured: boolean;
  /** Shown as a highlight in the /about Ecosystem Builder section. */
  aboutHighlight?: boolean;
}

/** ecosystem/main — page copy for /ecosystem-enabler. */
export interface EcosystemPage {
  /** "Ecosystem Enabler" (default) or "Ecosystem Builder". */
  title: string;
  intro?: string;
  heroImage?: MediaAsset;
  impact?: { heading?: string; paragraphs: string[]; image?: MediaAsset };
  /** The /about "Ecosystem Builder" section (shown only when enabled). */
  about?: EcosystemAbout;
}

export interface EcosystemAbout {
  enabled: boolean;
  heading: string;
  intro: string[];
  /** Label of the link to /ecosystem-enabler ("Explore Ecosystem Engagements"). */
  ctaLabel?: string;
  featuredImage?: MediaAsset;
  /** Supporting images; captions are stored on each image. */
  images: MediaAsset[];
}

/** avatar/main — the homepage "Meet Her Avatar" video. */
export interface AvatarVideo {
  enabled: boolean;
  label: string;
  title?: string;
  /** A YouTube URL or a direct https video file URL. */
  url?: string;
  poster?: MediaAsset;
}
