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
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

/** Singleton collections (hero, about, philosophy, siteSettings) hold one document with this id. */
export const SINGLETON_DOC_ID = "main";
