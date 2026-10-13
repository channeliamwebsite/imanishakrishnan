import type { z } from "zod";
import { COLLECTIONS, type CollectionName } from "@/lib/firebase/collections";
import { parseHero, parseStatistic } from "@/lib/content/normalize";
import {
  aboutSchema,
  listIssues,
  mediaFeatureSchema,
  philosophySchema,
  siteSettingsSchema,
  socialLinkSchema,
  speakingEventSchema,
  testimonialSchema,
  timelineItemSchema,
  workItemSchema,
} from "@/lib/content/schemas";
import * as builtIn from "@/lib/content/placeholder";

/**
 * The CMS's storage units. Each section is one published Firestore location (a singleton
 * document or a list collection) with one draft (cmsDrafts/{key}). Admin pages edit a section,
 * or a part of one (see lib/cms/pages.ts); publishing always publishes the whole section.
 */

export type SectionKey =
  | "hero"
  | "statistics"
  | "about"
  | "timeline"
  | "work"
  | "mediaFeatures"
  | "philosophy"
  | "siteSettings"
  | "socialLinks"
  | "speaking"
  | "testimonials";

export type Issue = { path: string; message: string };
/** Validation result: the normalised value to publish, or the problems to show. */
export type Validation = { ok: true; value: unknown } | { ok: false; issues: Issue[] };

export interface SectionDef {
  key: SectionKey;
  label: string;
  collection: CollectionName;
  kind: "singleton" | "list";
  /** The live site's content when nothing is published yet (lib/content/placeholder.ts). */
  builtIn: () => unknown;
  validate: (data: unknown) => Validation;
  /** List sections: the boolean field that shows/hides an item on the site. */
  visibleField?: "published" | "active";
  /** List sections: a new, empty item. */
  newItem?: () => Record<string, unknown>;
}

const fromSchema =
  (schema: z.ZodType) =>
  (data: unknown): Validation => {
    const result = schema.safeParse(data);
    return result.success ? { ok: true, value: result.data } : { ok: false, issues: listIssues(result.error) };
  };

/** Validates every item of a list; issue paths are prefixed with the item's position. */
const listOf =
  (validateItem: (item: unknown) => Validation) =>
  (data: unknown): Validation => {
    if (!Array.isArray(data)) return { ok: false, issues: [{ path: "", message: "Expected a list" }] };
    const issues: Issue[] = [];
    const value: unknown[] = [];
    data.forEach((item, i) => {
      const result = validateItem(item);
      if (result.ok) value.push(result.value);
      else issues.push(...result.issues.map((issue) => ({ ...issue, path: [i, issue.path].filter((p) => p !== "").join(".") })));
    });
    const ids = data.map((item) => (item as { id?: unknown })?.id);
    if (new Set(ids).size !== ids.length) issues.push({ path: "", message: "Two items share the same id" });
    return issues.length ? { ok: false, issues } : { ok: true, value };
  };

const fromParsed = (parsed: { value: unknown; error?: string }): Validation =>
  parsed.value === null ? { ok: false, issues: [{ path: "", message: parsed.error ?? "invalid" }] } : { ok: true, value: parsed.value };

/** Short random id for new list items and articles. */
export const newId = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;

export const SECTIONS: Record<SectionKey, SectionDef> = {
  hero: {
    key: "hero",
    label: "Hero",
    collection: COLLECTIONS.hero,
    kind: "singleton",
    builtIn: () => builtIn.hero,
    validate: (data) => {
      const parsed = parseHero(data, { primaryCta: builtIn.hero.primaryCta });
      if (parsed.value && parsed.warnings.some((w) => w.includes("primaryCta"))) {
        return { ok: false, issues: [{ path: "primaryCta", message: "The main button needs a label and a link" }] };
      }
      const image = (data as { image?: { url?: string } })?.image;
      if (parsed.value && image?.url && !parsed.value.image) {
        return { ok: false, issues: [{ path: "image", message: "The portrait must be uploaded to this site's Cloudinary account" }] };
      }
      return fromParsed(parsed);
    },
  },
  statistics: {
    key: "statistics",
    label: "Statistics",
    collection: COLLECTIONS.statistics,
    kind: "list",
    builtIn: () => builtIn.statistics,
    validate: listOf((item) => fromParsed(parseStatistic(String((item as { id?: unknown })?.id ?? ""), item))),
    visibleField: "active",
    newItem: () => ({ id: newId("stat"), value: "", title: "", description: "", order: 0, active: true }),
  },
  about: {
    key: "about",
    label: "About & profile",
    collection: COLLECTIONS.about,
    kind: "singleton",
    builtIn: () => builtIn.about,
    validate: fromSchema(aboutSchema),
  },
  timeline: {
    key: "timeline",
    label: "Timeline",
    collection: COLLECTIONS.timeline,
    kind: "list",
    builtIn: () => builtIn.timeline,
    validate: listOf(fromSchema(timelineItemSchema)),
    visibleField: "published",
    newItem: () => ({ id: newId("t"), order: 0, published: true, year: "", title: "", description: "", kind: "milestone" }),
  },
  work: {
    key: "work",
    label: "Work & initiatives",
    collection: COLLECTIONS.work,
    kind: "list",
    builtIn: () => builtIn.work,
    validate: listOf(fromSchema(workItemSchema)),
    visibleField: "published",
    newItem: () => ({
      id: newId("work"),
      order: 0,
      published: true,
      category: "",
      title: "",
      description: "",
      cta: { label: "Learn More", href: "/" },
    }),
  },
  mediaFeatures: {
    key: "mediaFeatures",
    label: "Media mentions",
    collection: COLLECTIONS.mediaFeatures,
    kind: "list",
    builtIn: () => builtIn.mediaFeatures,
    validate: listOf(fromSchema(mediaFeatureSchema)),
    visibleField: "published",
    newItem: () => ({ id: newId("m"), order: 0, published: true, publication: "" }),
  },
  philosophy: {
    key: "philosophy",
    label: "Philosophy",
    collection: COLLECTIONS.philosophy,
    kind: "singleton",
    builtIn: () => builtIn.philosophy,
    validate: fromSchema(philosophySchema),
  },
  siteSettings: {
    key: "siteSettings",
    label: "Site settings",
    collection: COLLECTIONS.siteSettings,
    kind: "singleton",
    builtIn: () => builtIn.siteSettings,
    validate: fromSchema(siteSettingsSchema),
  },
  socialLinks: {
    key: "socialLinks",
    label: "Social links",
    collection: COLLECTIONS.socialLinks,
    kind: "list",
    builtIn: () => builtIn.socialLinks,
    validate: listOf(fromSchema(socialLinkSchema)),
    visibleField: "published",
    newItem: () => ({ id: newId("social"), order: 0, published: true, platform: "linkedin", url: "", label: "" }),
  },
  speaking: {
    key: "speaking",
    label: "Events",
    collection: COLLECTIONS.speaking,
    kind: "list",
    builtIn: () => [],
    validate: listOf(fromSchema(speakingEventSchema)),
    visibleField: "published",
    newItem: () => ({ id: newId("event"), order: 0, published: true, title: "", event: "", location: "", date: "" }),
  },
  testimonials: {
    key: "testimonials",
    label: "Testimonials",
    collection: COLLECTIONS.testimonials,
    kind: "list",
    builtIn: () => [],
    validate: listOf(fromSchema(testimonialSchema)),
    visibleField: "published",
    newItem: () => ({ id: newId("quote"), order: 0, published: true, quote: "", name: "", role: "" }),
  },
};
