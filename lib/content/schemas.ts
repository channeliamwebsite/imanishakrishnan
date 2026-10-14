import { z } from "zod";
import type {
  AboutContent,
  FooterContent,
  IconName,
  Insight,
  Link,
  MediaAsset,
  MediaFeature,
  PhilosophyContent,
  ProfileContent,
  SectionCopy,
  SeoContent,
  SiteSettings,
  SocialLink,
  SocialPlatform,
  SpeakingEvent,
  Testimonial,
  TimelineEntry,
  WorkDetail,
  WorkItem,
} from "@/types/content";
import { isCloudinaryUrl } from "@/lib/cloudinary/url";
import type { Parsed } from "./normalize";

/**
 * Validation for every CMS section — the same schemas check what the admin publishes and what
 * the public site renders (an invalid Firestore document falls back to placeholder content).
 * Each schema's output type is pinned to the interface in types/content.ts.
 *
 * hero/main and statistics/* keep their dedicated parsers in ./normalize.ts.
 */

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

/** Trimmed text; `null`/missing → "". */
const text = z
  .string()
  .nullish()
  .transform((v) => (v ?? "").trim());

/** Required, non-empty text. */
const required = (label: string) => z.string({ error: `${label} is required` }).trim().min(1, `${label} is required`);

/** Optional text: blank, null or missing → undefined. */
const optional = z
  .string()
  .nullish()
  .transform((v) => v?.trim() || undefined);

/** Lists of short strings: blanks dropped. */
const stringList = z
  .array(z.string().nullish())
  .nullish()
  .transform((list) => (list ?? []).map((v) => (v ?? "").trim()).filter(Boolean));

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const SAFE_HREF = /^(\/|#|https?:\/\/|mailto:|tel:)/i;
const href = (label: string) =>
  required(label).refine((v) => SAFE_HREF.test(v), {
    message: `${label} must start with /, #, https://, mailto: or tel:`,
  });
const optionalUrl = (label: string) =>
  optional.refine((v) => v === undefined || /^https?:\/\//i.test(v), { message: `${label} must start with https://` });

export const linkSchema: z.ZodType<Link> = z.object({
  label: required("Link text"),
  href: href("Link address"),
});

const optionalLink = linkSchema.nullish().transform((v) => v ?? undefined);

const dimension = z
  .number()
  .nullish()
  .transform((n) => (n && n > 0 && Number.isFinite(n) ? Math.round(n) : undefined));

/**
 * A Cloudinary image reference. An empty url is an empty slot (the site shows its placeholder
 * frame). Any other url must be an https Cloudinary delivery URL for this account.
 */
export const mediaSchema: z.ZodType<MediaAsset> = z
  .object({
    url: text,
    publicId: text,
    width: dimension,
    height: dimension,
    alt: optional,
    resourceType: z
      .enum(["image", "video"])
      .nullish()
      .transform((v) => v ?? undefined),
    caption: optional,
    original: z
      .object({ url: text, width: dimension, height: dimension })
      .nullish()
      .transform((v) => (v?.url && isCloudinaryUrl(v.url) ? v : undefined)),
  })
  .refine((m) => !m.url || isCloudinaryUrl(m.url), {
    message: "Images must be uploaded to this site's Cloudinary account",
    path: ["url"],
  });

const optionalMedia = mediaSchema.nullish().transform((v) => v ?? undefined);
const mediaList = z
  .array(mediaSchema)
  .nullish()
  .transform((v) => v ?? []);

export const ICON_NAMES = [
  "megaphone",
  "video",
  "message",
  "trophy",
  "mic",
  "building",
  "globe",
  "users",
  "sparkles",
  "newspaper",
  "award",
  "trending",
  "chart",
  "lightbulb",
] as const satisfies readonly IconName[];

const optionalIcon = z
  .enum(ICON_NAMES)
  .nullish()
  .catch(undefined)
  .transform((v) => v ?? undefined);

const listItem = {
  id: required("id"),
  order: z
    .number()
    .nullish()
    .transform((v) => v ?? 0),
  published: z
    .boolean()
    .nullish()
    .transform((v) => v ?? true),
};

/* ------------------------------------------------------------------ */
/* Singletons                                                          */
/* ------------------------------------------------------------------ */

const profileItem = z.object({
  title: required("Title"),
  description: text,
  details: stringList.transform((v) => (v.length ? v : undefined)),
  strengths: optional,
  anchor: optional,
  icon: optionalIcon,
});

/** An image the editor uploaded; empty upload slots are dropped. */
const uploadedMedia = optionalMedia.transform((m) => (m?.url ? m : undefined));

const recognitionItem = z.object({
  image: mediaSchema,
  title: optional,
  organisation: optional,
  year: optional,
  published: z
    .boolean()
    .nullish()
    .transform((v) => v ?? true),
});

export const profileSchema: z.ZodType<ProfileContent> = z.object({
  tagline: text,
  detailedBio: stringList,
  achievements: z.object({
    heading: required("Achievements heading"),
    tagline: optional,
    groups: z.array(z.object({ heading: required("Group heading"), items: z.array(profileItem) })),
    gallery: z
      .array(recognitionItem)
      .nullish()
      .transform((list) => {
        const uploaded = (list ?? []).filter((r) => r.image.url);
        return uploaded.length ? uploaded : undefined;
      }),
  }),
  expertise: z.object({
    heading: required("Expertise heading"),
    subtitle: text,
    intro: stringList,
    items: z.array(profileItem),
    distinctiveStrength: z.object({ heading: text, paragraphs: stringList }),
  }),
  philosophy: z.object({
    heading: required("Philosophy heading"),
    subtitle: text,
    paragraphs: stringList,
    image: uploadedMedia,
    quote: optional,
  }),
  intro: z
    .object({ image: uploadedMedia, quote: optional })
    .nullish()
    .transform((v) => (v && (v.image || v.quote) ? v : undefined)),
  storyImage: uploadedMedia,
  page: z
    .object({
      eyebrow: text,
      title: required("Page title"),
      metaDescription: text,
      biographyLabel: text,
      biographyHeading: text,
      milestonesLabel: text,
      milestonesHeading: text,
      milestonesIntro: optional,
      recognitionLabel: text,
      leadershipLabel: text,
    })
    .nullish()
    .transform((v) => v ?? undefined),
});

export const aboutSchema: z.ZodType<AboutContent> = z.object({
  label: text,
  heading: required("Heading"),
  intro: optional,
  paragraphs: stringList,
  closing: optional,
  cta: linkSchema,
  images: mediaList,
  keywords: stringList,
  profile: profileSchema.nullish().transform((v) => v ?? undefined),
});

export const philosophySchema: z.ZodType<PhilosophyContent> = z.object({
  quote: required("Quote"),
  supportingText: text,
  author: text,
  image: mediaSchema.nullish().transform((v) => v ?? { url: "", publicId: "" }),
});

const footerSchema: z.ZodType<FooterContent> = z.object({
  description: text,
  quickLinksTitle: text,
  connectTitle: text,
  connectText: text,
  contactEmail: optional.refine((v) => v === undefined || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), {
    message: "Contact email is not a valid address",
  }),
  newsletterPlaceholder: optional,
  copyright: text,
  legalLinks: z
    .array(linkSchema)
    .nullish()
    .transform((v) => v ?? []),
});

const seoSchema: z.ZodType<SeoContent> = z.object({
  title: required("SEO title"),
  titleTemplate: required("Title template").refine((v) => v.includes("%s"), {
    message: "Title template must contain %s (where the page title goes)",
  }),
  description: text,
  keywords: stringList,
  siteUrl: required("Site URL").refine((v) => /^https?:\/\/[^\s/]+/i.test(v), {
    message: "Site URL must be a full address, e.g. https://example.com",
  }),
  ogImage: optionalMedia,
});

const workDetailCopySchema = z
  .object({
    backLabel: required("Back link text"),
    aboutLabel: required("About label"),
    highlightsLabel: required("Key figures label"),
    workLabel: required("Expertise label"),
    strengthsLabel: required("Core strengths label"),
    milestonesLabel: required("Milestones label"),
    galleryLabel: required("Gallery label"),
  })
  .nullish()
  .transform((v) => v ?? undefined);

const sectionsSchema: z.ZodType<SectionCopy> = z.object({
  work: z.object({ label: optional, heading: required("Work heading"), cta: optionalLink, detail: workDetailCopySchema }),
  media: z.object({ label: optional, heading: required("Media heading"), tagline: optional }),
  awards: z
    .object({ label: optional, heading: required("Awards heading"), tagline: optional })
    .nullish()
    .transform((v) => v ?? undefined),
  testimonials: z
    .object({
      label: optional,
      heading: required("Testimonials heading"),
      intro: optional,
      // Empty upload slots are dropped; every kept image is a validated Cloudinary asset.
      images: mediaList.transform((list) => {
        const uploaded = list.filter((m) => m.url);
        return uploaded.length ? uploaded : undefined;
      }),
      cta: optionalLink,
    })
    .nullish()
    .transform((v) => v ?? undefined),
  insights: z.object({
    label: optional,
    heading: required("Insights heading"),
    intro: text,
    cta: optionalLink,
    emptyText: optional,
  }),
});

export const siteSettingsSchema: z.ZodType<SiteSettings> = z.object({
  siteName: required("Site name"),
  roles: stringList,
  navigation: z.array(linkSchema),
  connectCta: linkSchema,
  footer: footerSchema,
  seo: seoSchema,
  sections: sectionsSchema,
});

/* ------------------------------------------------------------------ */
/* List items                                                          */
/* ------------------------------------------------------------------ */

export const timelineItemSchema: z.ZodType<TimelineEntry> = z.object({
  ...listItem,
  year: required("Year / marker"),
  title: required("Title"),
  description: optional,
  kind: z
    .enum(["milestone", "figure", "vision"])
    .nullish()
    .catch(undefined)
    .transform((v) => v ?? undefined),
  image: optionalMedia,
});

export const workItemSchema: z.ZodType<WorkItem> = z.object({
  ...listItem,
  logo: optionalMedia,
  icon: optionalIcon,
  tagline: optional,
  coverImage: optionalMedia,
  gallery: mediaList.transform((v) => (v.length ? v : undefined)),
  category: text,
  title: required("Title"),
  description: required("Description"),
  cta: linkSchema,
  slug: optional.refine((v) => v === undefined || SLUG_PATTERN.test(v), {
    message: "Slug may contain only lowercase letters, numbers and hyphens",
  }),
  detail: z
    .object({
      title: optional,
      intro: optional,
      organisation: optional,
      period: optional,
      seo: z
        .object({ title: optional, description: optional })
        .nullish()
        .transform((v) => (v && (v.title || v.description) ? v : undefined)),
      aboutHeading: optional,
      paragraphs: stringList,
      expertiseAnchor: optional,
      milestoneIds: stringList,
      highlights: z
        .array(z.object({ value: text, label: text }))
        .nullish()
        .transform((list) => (list ?? []).filter((h) => h.value && h.label)),
      cta: optionalLink,
    })
    .nullish()
    .transform((d): WorkDetail | undefined => {
      if (!d) return undefined;
      const detail: WorkDetail = {
        title: d.title,
        intro: d.intro,
        organisation: d.organisation,
        period: d.period,
        seo: d.seo,
        aboutHeading: d.aboutHeading,
        paragraphs: d.paragraphs.length ? d.paragraphs : undefined,
        expertiseAnchor: d.expertiseAnchor,
        milestoneIds: d.milestoneIds.length ? d.milestoneIds : undefined,
        highlights: d.highlights.length ? d.highlights : undefined,
        cta: d.cta,
      };
      return Object.values(detail).some((v) => v !== undefined) ? detail : undefined;
    }),
});

export const mediaFeatureSchema: z.ZodType<MediaFeature> = z.object({
  ...listItem,
  publication: required("Publication"),
  logo: optionalMedia,
  articleUrl: optionalUrl("Article link"),
});

const SOCIAL_PLATFORMS = ["linkedin", "x", "instagram", "youtube", "facebook", "email"] as const satisfies readonly SocialPlatform[];

export const socialLinkSchema: z.ZodType<SocialLink> = z.object({
  ...listItem,
  platform: z.enum(SOCIAL_PLATFORMS, { error: "Choose a platform" }),
  url: required("Address").refine((v) => /^(https:\/\/|mailto:)/i.test(v), {
    message: "Address must start with https:// (or mailto: for email)",
  }),
  label: required("Label"),
});

const isoDate = (label: string) =>
  required(label).refine((v) => !Number.isNaN(Date.parse(v)), { message: `${label} is not a valid date` });

export const speakingEventSchema: z.ZodType<SpeakingEvent> = z.object({
  ...listItem,
  title: required("Title"),
  event: required("Event"),
  location: text,
  date: isoDate("Date"),
  image: optionalMedia,
  gallery: mediaList.transform((v) => (v.length ? v : undefined)),
  url: optionalUrl("Event link"),
});

export const testimonialSchema: z.ZodType<Testimonial> = z.object({
  ...listItem,
  quote: required("Quote"),
  name: required("Name"),
  role: text,
  organisation: optional,
  avatar: optionalMedia,
  logo: optionalMedia,
});

export const insightSchema: z.ZodType<Insight> = z.object({
  ...listItem,
  slug: required("Slug").refine((v) => SLUG_PATTERN.test(v), {
    message: "Slug may contain only lowercase letters, numbers and hyphens",
  }),
  title: required("Title"),
  excerpt: text,
  // Shown on every article card next to the date.
  category: required("Main category"),
  categories: stringList.transform((v) => (v.length ? v : undefined)),
  tags: stringList.transform((v) => (v.length ? v : undefined)),
  author: optional,
  coverImage: optionalMedia,
  publishedAt: isoDate("Publish date"),
  updatedAt: optional,
  createdAt: optional,
  featured: z
    .boolean()
    .nullish()
    .transform((v) => v ?? false),
  body: optional,
  seo: z
    .object({ title: optional, description: optional, image: optionalMedia })
    .nullish()
    .transform((v) => (v && (v.title || v.description || v.image) ? v : undefined)),
});

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Human-readable first problem, e.g. "cta.href: Link address must start with …". */
export function describeIssue(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "invalid";
  const path = issue.path.join(".");
  return path ? `${path}: ${issue.message}` : issue.message;
}

/** Every problem, for the admin's error list. */
export function listIssues(error: z.ZodError): { path: string; message: string }[] {
  return error.issues.map((issue) => ({ path: issue.path.map(String).join("."), message: issue.message }));
}

/** Runs a schema in the same Parsed<T> shape as the hand-written parsers. */
export function parseWith<T>(schema: z.ZodType<T>, raw: unknown): Parsed<T> {
  const result = schema.safeParse(raw);
  return result.success ? { value: result.data, warnings: [] } : { value: null, error: describeIssue(result.error) };
}
