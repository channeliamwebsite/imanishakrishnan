import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { getAllDocuments, getPublishedList, getSingleton } from "@/lib/firebase/firestore";
import type {
  AboutContent,
  HeroContent,
  HomeContent,
  ImpactStatistic,
  Insight,
  MediaFeature,
  PhilosophyContent,
  SiteSettings,
  SocialLink,
  TimelineEntry,
  WorkItem,
} from "@/types/content";
import { parseHero, parseStatistic, selectActiveStatistics } from "./normalize";
import * as fallback from "./placeholder";

/**
 * Content repository. Pages only ever call these functions — they never touch Firestore
 * directly — so swapping placeholders for live CMS data needs no component changes.
 *
 * Every getter is cached and tagged with its collection name, so the admin can call
 * `updateTag("<collection>")` after a write to refresh just that section.
 */

async function safe<T>(read: () => Promise<T | null>, fallbackValue: T, label: string): Promise<T> {
  try {
    const value = await read();
    if (value === null) return fallbackValue;
    if (Array.isArray(value) && value.length === 0) return fallbackValue;
    return value;
  } catch (error) {
    console.error(`[content] Failed to load "${label}", using placeholder.`, error);
    return fallbackValue;
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache";
  cacheLife("hours");
  cacheTag(COLLECTIONS.siteSettings);
  return safe(() => getSingleton<SiteSettings>(COLLECTIONS.siteSettings), fallback.siteSettings, "siteSettings");
}

export async function getSocialLinks(): Promise<SocialLink[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(COLLECTIONS.socialLinks);
  return safe(() => getPublishedList<SocialLink>(COLLECTIONS.socialLinks), fallback.socialLinks, "socialLinks");
}

/* ------------------------------------------------------------------ */
/* Validated loaders (Hero, Statistics)                                */
/* ------------------------------------------------------------------ */

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
 * recovers quickly; "not configured" and "no document" are normal states cached for hours.
 */
type Loaded<T> = { data: T | null; failed: boolean };

async function readHero(): Promise<Loaded<HeroContent>> {
  try {
    const raw = await withTimeout(getSingleton<unknown>(COLLECTIONS.hero), "hero");
    if (raw === null) return { data: null, failed: false }; // not configured, or hero/main missing
    const parsed = parseHero(raw, { primaryCta: fallback.hero.primaryCta });
    if (parsed.value === null) console.warn(`[content] hero/main is invalid (${parsed.error}); using placeholder.`);
    else for (const warning of parsed.warnings) console.warn(`[content] hero/main: ${warning}.`);
    return { data: parsed.value, failed: false };
  } catch (error) {
    console.error(error instanceof Error ? error.message : error, "— using placeholder.");
    return { data: null, failed: true };
  }
}

async function readStatistics(): Promise<Loaded<ImpactStatistic[]>> {
  try {
    const docs = await withTimeout(getAllDocuments(COLLECTIONS.statistics), "statistics");
    if (docs === null || docs.length === 0) return { data: null, failed: false }; // not configured / empty
    const valid: ImpactStatistic[] = [];
    for (const { id, data } of docs) {
      const parsed = parseStatistic(id, data);
      if (parsed.value === null) console.warn(`[content] statistics/${id} skipped (${parsed.error}).`);
      else valid.push(parsed.value);
    }
    // Every document invalid → placeholder. Valid but all inactive → editor hid them: show none.
    if (valid.length === 0) return { data: null, failed: false };
    return { data: selectActiveStatistics(valid), failed: false };
  } catch (error) {
    console.error(error instanceof Error ? error.message : error, "— using placeholder.");
    return { data: null, failed: true };
  }
}

/** hero/main from Firestore, or placeholder content when unavailable/invalid. */
export async function getHero(): Promise<HeroContent> {
  "use cache";
  cacheTag(COLLECTIONS.hero);
  const { data, failed } = await readHero();
  if (failed) cacheLife("minutes");
  else cacheLife("hours");
  return data ?? fallback.hero;
}

/** Active statistics ordered by `order`, or placeholder content when unavailable/empty. */
export async function getStatistics(): Promise<ImpactStatistic[]> {
  "use cache";
  cacheTag(COLLECTIONS.statistics);
  const { data, failed } = await readStatistics();
  if (failed) cacheLife("minutes");
  else cacheLife("hours");
  return data ?? fallback.statistics;
}

export async function getAbout(): Promise<AboutContent> {
  "use cache";
  cacheLife("hours");
  cacheTag(COLLECTIONS.about);
  return safe(() => getSingleton<AboutContent>(COLLECTIONS.about), fallback.about, "about");
}

export async function getTimeline(): Promise<TimelineEntry[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(COLLECTIONS.timeline);
  return safe(() => getPublishedList<TimelineEntry>(COLLECTIONS.timeline), fallback.timeline, "timeline");
}

export async function getWork(): Promise<WorkItem[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(COLLECTIONS.work);
  return safe(() => getPublishedList<WorkItem>(COLLECTIONS.work), fallback.work, "work");
}

export async function getMediaFeatures(): Promise<MediaFeature[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(COLLECTIONS.mediaFeatures);
  return safe(
    () => getPublishedList<MediaFeature>(COLLECTIONS.mediaFeatures),
    fallback.mediaFeatures,
    "mediaFeatures",
  );
}

export async function getPhilosophy(): Promise<PhilosophyContent> {
  "use cache";
  cacheLife("hours");
  cacheTag(COLLECTIONS.philosophy);
  return safe(() => getSingleton<PhilosophyContent>(COLLECTIONS.philosophy), fallback.philosophy, "philosophy");
}

/**
 * Latest published insights, newest first.
 * Requires a Firestore composite index on insights: published ASC, publishedAt DESC.
 */
export async function getLatestInsights(count = 3): Promise<Insight[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(COLLECTIONS.insights);
  return safe(
    () =>
      getPublishedList<Insight>(COLLECTIONS.insights, {
        orderField: "publishedAt",
        direction: "desc",
        limit: count,
      }),
    fallback.insights.slice(0, count),
    "insights",
  );
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
