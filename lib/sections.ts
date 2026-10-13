/**
 * Anchor ids for homepage sections. Navigation links (from siteSettings) point at
 * `/#<id>`, so adding a section later — e.g. Speaking — only needs a component that
 * renders `id={SECTION_IDS.speaking}`; the navbar never changes.
 */
export const SECTION_IDS = {
  about: "about",
  leadership: "leadership",
  impact: "impact",
  media: "media",
  awards: "awards",
  speaking: "speaking",
  insights: "insights",
  contact: "contact",
} as const;

export type SectionId = (typeof SECTION_IDS)[keyof typeof SECTION_IDS];

export const sectionHref = (id: SectionId) => `/#${id}`;

/** Detail page of a Selected Work item. */
export const workPath = (slug: string) => `/work/${slug}`;
