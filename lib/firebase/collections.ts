/** Firestore collection names. Single source of truth for the site and the future admin. */
export const COLLECTIONS = {
  hero: "hero",
  statistics: "statistics",
  about: "about",
  timeline: "timeline",
  work: "work",
  mediaFeatures: "mediaFeatures",
  philosophy: "philosophy",
  insights: "insights",
  speaking: "speaking",
  achievements: "achievements",
  testimonials: "testimonials",
  siteSettings: "siteSettings",
  socialLinks: "socialLinks",
  press: "press",
  videos: "videos",
  ecosystem: "ecosystem",
  ecosystemEvents: "ecosystemEvents",
  ecosystemVideos: "ecosystemVideos",
  avatar: "avatar",
  editorialVideos: "editorialVideos",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

/** Singleton collections (hero, about, philosophy, siteSettings) hold one document with this id. */
export const SINGLETON_DOC_ID = "main";

/**
 * Written into a list collection by every admin publish. It tells "published, but empty"
 * (show nothing) apart from "never published" (show placeholder content). Not a content item.
 */
export const LIST_META_DOC_ID = "_meta";

/**
 * Admin-only collections (see firestore.rules). Never read by the public site.
 *   admins/{uid}         grants the admin role — created only from the console or scripts/grant-admin.ts
 *   cmsDrafts/{section}  unpublished edits of one section (see lib/cms/sections.ts)
 *   insightDrafts/{id}   unpublished edits of one blog article
 *   mediaLibrary/{id}    record of every asset uploaded to Cloudinary through the admin
 */
export const PRIVATE_COLLECTIONS = {
  admins: "admins",
  cmsDrafts: "cmsDrafts",
  insightDrafts: "insightDrafts",
  mediaLibrary: "mediaLibrary",
} as const;
