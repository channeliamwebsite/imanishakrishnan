import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { COLLECTIONS, LIST_META_DOC_ID, type CollectionName } from "@/lib/firebase/collections";
import { getAllDocuments, getPublishedDocuments, getPublishedDocumentsWhere, getSingleton } from "@/lib/firebase/firestore";
import type {
  AboutContent,
  Achievement,
  HeroContent,
  HomeContent,
  ImpactStatistic,
  Insight,
  ListItemBase,
  MediaFeature,
  PhilosophyContent,
  ProfileItem,
  SiteSettings,
  SocialLink,
  SpeakingEvent,
  Testimonial,
  TimelineEntry,
  WorkDetailCopy,
  WorkItem,
} from "@/types/content";
import { parseHero, parseStatistic, selectActiveStatistics, type Parsed } from "./normalize";
import {
  aboutSchema,
  insightSchema,
  mediaFeatureSchema,
  parseWith,
  philosophySchema,
  siteSettingsSchema,
  socialLinkSchema,
  speakingEventSchema,
  testimonialSchema,
  timelineItemSchema,
  workItemSchema,
} from "./schemas";
import * as fallback from "./placeholder";
import { profile as fallbackProfile } from "./profile";

/**
 * Content repository. Pages only ever call these functions — they never touch Firestore
 * directly. Firestore holds the *published* content (drafts live in admin-only collections and
 * are never read here). Every document is validated before it reaches a component; when a
 * section was never published, is invalid or can't be read, the placeholder content is used.
 *
 * Every getter is cached and tagged with its collection name; the admin calls
 * `updateTag("<collection>")` after publishing (lib/admin/actions.ts).
 */

const READ_TIMEOUT_MS = 8000;

/** Reject if Firestore doesn't answer in time, so a hung connection can't stall rendering. */
async function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`timed out after ${READ_TIMEOUT_MS}ms`)), READ_TIMEOUT_MS);
  });
  try {
    return await Promise.race([promise, timeout]);
  } catch (error) {
    // Server-side log only: the message, never config or credentials.
    throw new Error(`[content] ${label}: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Outcome of a read. `failed` (network/permission/timeout) is cached briefly so the site
 * recovers quickly; "not configured", "never published" and "invalid" are cached for hours.
 * `data: null` means "use the placeholder".
 */
type Loaded<T> = { data: T | null; failed: boolean };

/** Applies the cache lifetime for a read outcome and resolves the placeholder. Call inside "use cache". */
function settle<T>({ data, failed }: Loaded<T>, placeholder: T): T {
  if (failed) cacheLife("minutes");
  else cacheLife("hours");
  return data ?? placeholder;
}

/** A singleton document (collection/main), validated. */
async function loadSingleton<T>(name: CollectionName, parse: (raw: unknown) => Parsed<T>): Promise<Loaded<T>> {
  try {
    const raw = await withTimeout(getSingleton<unknown>(name), name);
    if (raw === null) return { data: null, failed: false }; // not configured, or never published
    const parsed = parse(raw);
    if (parsed.value === null) console.warn(`[content] ${name}/main is invalid (${parsed.error}); using placeholder.`);
    else for (const warning of parsed.warnings ?? []) console.warn(`[content] ${name}/main: ${warning}.`);
    return { data: parsed.value, failed: false };
  } catch (error) {
    console.error(error instanceof Error ? error.message : error, "— using placeholder.");
    return { data: null, failed: true };
  }
}

type Doc = { id: string; data: Record<string, unknown> };

/**
 * Validates the documents of a list collection. Invalid documents are skipped. Returns null
 * (placeholder) when the collection was never published, or when every document is invalid.
 * A collection published by the admin always contains the _meta document, so publishing an
 * empty or fully hidden list shows nothing rather than the placeholder.
 */
function validateList<T>(name: string, docs: Doc[], parse: (id: string, raw: unknown) => Parsed<T>): T[] | null {
  const published = docs.some((d) => d.id === LIST_META_DOC_ID);
  const items = docs.filter((d) => d.id !== LIST_META_DOC_ID);
  if (items.length === 0) return published ? [] : null;
  const valid: T[] = [];
  for (const { id, data } of items) {
    const parsed = parse(id, data);
    if (parsed.value === null) console.warn(`[content] ${name}/${id} skipped (${parsed.error}).`);
    else valid.push(parsed.value);
  }
  return valid.length === 0 && !published ? null : valid;
}

const byOrder = <T extends Pick<ListItemBase, "order" | "id">>(a: T, b: T) => a.order - b.order || a.id.localeCompare(b.id);

/**
 * A list collection's visible items in `order`. All documents are read and filtered in code —
 * these collections are small, and it needs no composite index.
 */
async function loadList<T extends ListItemBase>(
  name: CollectionName,
  parse: (id: string, raw: unknown) => Parsed<T>,
): Promise<Loaded<T[]>> {
  try {
    const docs = await withTimeout(getAllDocuments(name), name);
    if (docs === null) return { data: null, failed: false };
    const items = validateList(name, docs, parse);
    return { data: items && items.filter((item) => item.published).sort(byOrder), failed: false };
  } catch (error) {
    console.error(error instanceof Error ? error.message : error, "— using placeholder.");
    return { data: null, failed: true };
  }
}

const item =
  <T>(schema: Parameters<typeof parseWith<T>>[0]) =>
  (id: string, raw: unknown) =>
    parseWith(schema, { ...(raw as object), id });

/* ------------------------------------------------------------------ */
/* Site-wide                                                           */
/* ------------------------------------------------------------------ */

export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache";
  cacheTag(COLLECTIONS.siteSettings);
  return settle(await loadSingleton(COLLECTIONS.siteSettings, (raw) => parseWith(siteSettingsSchema, raw)), fallback.siteSettings);
}

export async function getSocialLinks(): Promise<SocialLink[]> {
  "use cache";
  cacheTag(COLLECTIONS.socialLinks);
  return settle(await loadList(COLLECTIONS.socialLinks, item(socialLinkSchema)), fallback.socialLinks);
}

/* ------------------------------------------------------------------ */
/* Homepage sections                                                   */
/* ------------------------------------------------------------------ */

/** hero/main from Firestore, or placeholder content when unavailable/invalid. */
export async function getHero(): Promise<HeroContent> {
  "use cache";
  cacheTag(COLLECTIONS.hero);
  return settle(
    await loadSingleton(COLLECTIONS.hero, (raw) => parseHero(raw, { primaryCta: fallback.hero.primaryCta })),
    fallback.hero,
  );
}

async function readStatistics(): Promise<Loaded<ImpactStatistic[]>> {
  try {
    const docs = await withTimeout(getAllDocuments(COLLECTIONS.statistics), "statistics");
    if (docs === null) return { data: null, failed: false };
    const valid = validateList("statistics", docs, parseStatistic);
    // Valid but all inactive → the editor hid them: show none.
    return { data: valid && selectActiveStatistics(valid), failed: false };
  } catch (error) {
    console.error(error instanceof Error ? error.message : error, "— using placeholder.");
    return { data: null, failed: true };
  }
}

/** Active statistics ordered by `order`, or placeholder content when unavailable/empty. */
export async function getStatistics(): Promise<ImpactStatistic[]> {
  "use cache";
  cacheTag(COLLECTIONS.statistics);
  return settle(await readStatistics(), fallback.statistics);
}

export async function getAbout(): Promise<AboutContent> {
  "use cache";
  cacheTag(COLLECTIONS.about);
  return settle(await loadSingleton(COLLECTIONS.about, (raw) => parseWith(aboutSchema, raw)), fallback.about);
}

export async function getTimeline(): Promise<TimelineEntry[]> {
  "use cache";
  cacheTag(COLLECTIONS.timeline);
  return settle(await loadList(COLLECTIONS.timeline, item(timelineItemSchema)), fallback.timeline);
}

export async function getWork(): Promise<WorkItem[]> {
  "use cache";
  cacheTag(COLLECTIONS.work);
  return settle(await loadList(COLLECTIONS.work, item(workItemSchema)), fallback.work);
}

/** Everything a work detail page (/work/{slug}) shows, resolved from its references. */
export interface WorkDetailContent {
  item: WorkItem;
  /** The referenced area of expertise (about/main → profile.expertise). */
  expertise?: ProfileItem;
  milestones: TimelineEntry[];
  copy: WorkDetailCopy;
}

/** Slugs of the published work items that have a detail page. */
export async function getWorkDetailSlugs(): Promise<string[]> {
  return (await getWork()).flatMap((w) => (w.slug ? [w.slug] : []));
}

/**
 * A work item's detail page content, or null when no published item has that slug. Cached per
 * slug (like getInsightBySlug), so the page's params never stall rendering.
 */
export async function getWorkDetail(slug: string): Promise<WorkDetailContent | null> {
  "use cache";
  cacheTag(COLLECTIONS.work, COLLECTIONS.about, COLLECTIONS.timeline, COLLECTIONS.siteSettings);
  const [work, about, timeline, settings] = await Promise.all([getWork(), getAbout(), getTimeline(), getSiteSettings()]);
  const workItem = work.find((w) => w.slug === slug);
  if (!workItem) return null;
  const { detail } = workItem;
  const expertiseItems = (about.profile ?? fallbackProfile).expertise.items;
  return {
    item: workItem,
    expertise: detail?.expertiseAnchor ? expertiseItems.find((x) => x.anchor === detail.expertiseAnchor) : undefined,
    milestones: (detail?.milestoneIds ?? []).flatMap((id) => timeline.filter((entry) => entry.id === id)),
    copy: settings.sections.work.detail ?? fallback.workDetailCopy,
  };
}

export async function getMediaFeatures(): Promise<MediaFeature[]> {
  "use cache";
  cacheTag(COLLECTIONS.mediaFeatures);
  return settle(await loadList(COLLECTIONS.mediaFeatures, item(mediaFeatureSchema)), fallback.mediaFeatures);
}

/**
 * The achievements collection. Not rendered: the awards shown on /about come from
 * about/main → profile.achievements (see docs/cms-architecture.md).
 */
export async function getAchievements(): Promise<Achievement[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(COLLECTIONS.achievements);
  return fallback.achievements;
}

export async function getPhilosophy(): Promise<PhilosophyContent> {
  "use cache";
  cacheTag(COLLECTIONS.philosophy);
  return settle(await loadSingleton(COLLECTIONS.philosophy, (raw) => parseWith(philosophySchema, raw)), fallback.philosophy);
}

/** Speaking events, managed in the admin. No public section renders them yet. */
export async function getSpeakingEvents(): Promise<SpeakingEvent[]> {
  "use cache";
  cacheTag(COLLECTIONS.speaking);
  return settle(await loadList(COLLECTIONS.speaking, item(speakingEventSchema)), []);
}

/** Testimonials, managed in the admin. No public section renders them yet. */
export async function getTestimonials(): Promise<Testimonial[]> {
  "use cache";
  cacheTag(COLLECTIONS.testimonials);
  return settle(await loadList(COLLECTIONS.testimonials, item(testimonialSchema)), []);
}

/* ------------------------------------------------------------------ */
/* Insights (blog)                                                     */
/* ------------------------------------------------------------------ */

/**
 * Every published article, newest first. The query filters on `published == true` (required by
 * firestore.rules, which hide unpublished articles) and sorts in code — no composite index.
 */
export async function getInsights(): Promise<Insight[]> {
  "use cache";
  cacheTag(COLLECTIONS.insights);
  let loaded: Loaded<Insight[]>;
  try {
    const docs = await withTimeout(getPublishedDocuments(COLLECTIONS.insights), "insights");
    const valid = docs && validateList("insights", docs, item(insightSchema));
    loaded = {
      data: valid && valid.filter((a) => a.published).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)),
      failed: false,
    };
  } catch (error) {
    console.error(error instanceof Error ? error.message : error, "— no articles shown.");
    loaded = { data: null, failed: true };
  }
  return settle(loaded, fallback.insights);
}

export async function getLatestInsights(count = 3): Promise<Insight[]> {
  return (await getInsights()).slice(0, count);
}

/**
 * One published article. Cached per slug (not derived from getInsights()), so an article published
 * after the build is read fresh the first time its page is requested.
 */
export async function getInsightBySlug(slug: string): Promise<Insight | null> {
  "use cache";
  cacheTag(COLLECTIONS.insights);
  let loaded: Loaded<Insight | null>;
  try {
    const docs = await withTimeout(getPublishedDocumentsWhere(COLLECTIONS.insights, "slug", slug), `insights/${slug}`);
    const valid = docs && validateList("insights", docs, item(insightSchema));
    loaded = { data: valid?.find((a) => a.published && a.slug === slug) ?? null, failed: false };
  } catch (error) {
    console.error(error instanceof Error ? error.message : error, "— article not shown.");
    loaded = { data: null, failed: true };
  }
  return settle(loaded, null);
}

export async function getHomeContent(): Promise<HomeContent> {
  const [hero, statistics, about, timeline, work, mediaFeatures, philosophy, insights] =
    await Promise.all([
      getHero(),
      getStatistics(),
      getAbout(),
      getTimeline(),
      getWork(),
      getMediaFeatures(),
      getPhilosophy(),
      getLatestInsights(3),
    ]);
  return { hero, statistics, about, timeline, work, mediaFeatures, philosophy, insights };
}
