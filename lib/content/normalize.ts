import type { HeroContent, IconName, ImpactStatistic, MediaAsset } from "@/types/content";
import { isCloudinaryUrl } from "@/lib/cloudinary/url";

/**
 * Runtime validation for Firestore documents. Firestore is schemaless and documents are
 * edited by hand until the admin exists, so every field is checked before it reaches a
 * component. Invalid documents return null (callers fall back to placeholder content)
 * along with the reason; recoverable problems are returned as warnings. Both are logged
 * server-side only.
 */

type Raw = Record<string, unknown>;
export type Parsed<T> =
  | { value: T; error?: undefined; warnings: string[] }
  | { value: null; error: string; warnings?: undefined };

const isRecord = (v: unknown): v is Raw => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown): string | undefined => (typeof v === "string" && v.trim() ? v.trim() : undefined);
const optStr = (v: unknown): string | undefined => (typeof v === "string" ? v.trim() : undefined);
const num = (v: unknown): number | undefined => (typeof v === "number" && Number.isFinite(v) ? v : undefined);
/** Pixel dimensions: positive numbers only (0 means "unknown" in hand-written docs). */
const dimension = (v: unknown): number | undefined => {
  const n = num(v);
  return n !== undefined && n > 0 ? Math.round(n) : undefined;
};

const fail = (error: string): Parsed<never> => ({ value: null, error });

/**
 * A Cloudinary image reference.
 * - absent → no image (placeholder frame)
 * - `url: ""` → empty slot; alt text is kept for the placeholder
 * - a url that isn't an https Cloudinary delivery URL (for this account, when the cloud
 *   name is configured) → rejected, placeholder frame shown
 * - missing publicId → image still shown, but flagged (the admin needs it to manage assets)
 */
export function parseMedia(raw: unknown, field = "image"): { value?: MediaAsset; issue?: string } {
  if (raw === undefined || raw === null) return {};
  if (!isRecord(raw)) return { issue: `${field} must be an object` };
  if (typeof raw.url !== "string") return { issue: `${field}.url must be a string` };

  const url = raw.url.trim();
  const media: MediaAsset = {
    url,
    publicId: optStr(raw.publicId) ?? "",
    width: dimension(raw.width),
    height: dimension(raw.height),
    alt: str(raw.alt),
  };
  if (!url) return { value: media };
  if (!isCloudinaryUrl(url)) return { issue: `${field}.url is not a Cloudinary delivery URL for this account` };
  if (!media.publicId) return { value: media, issue: `${field}.publicId is missing` };
  return { value: media };
}

export function parseHero(
  raw: unknown,
  defaults: { primaryCta: HeroContent["primaryCta"] },
): Parsed<HeroContent> {
  if (!isRecord(raw)) return fail("document is not an object");
  const warnings: string[] = [];

  const eyebrow = optStr(raw.eyebrow);
  const name = str(raw.name);
  const designation = str(raw.designation);
  const description = str(raw.description);
  const location = optStr(raw.location);
  if (eyebrow === undefined) return fail("eyebrow must be a string");
  if (!name) return fail("name is required");
  if (!designation) return fail("designation is required");
  if (!description) return fail("description is required");
  if (location === undefined) return fail("location must be a string");

  if (raw.roles !== undefined && !Array.isArray(raw.roles)) return fail("roles must be an array");
  const roles = ((raw.roles as unknown[] | undefined) ?? []).map(str).filter((r): r is string => !!r);

  // The primary CTA is navigation, not content: when absent or incomplete, use the site default.
  let primaryCta = defaults.primaryCta;
  if (raw.primaryCta !== undefined) {
    const label = isRecord(raw.primaryCta) ? str(raw.primaryCta.label) : undefined;
    const link = isRecord(raw.primaryCta) ? str(raw.primaryCta.link) : undefined;
    if (label && link) primaryCta = { label, link };
    else warnings.push("primaryCta needs label and link; using the default");
  }

  let secondaryCta: HeroContent["secondaryCta"];
  if (isRecord(raw.secondaryCta) && str(raw.secondaryCta.label)) {
    secondaryCta = { label: str(raw.secondaryCta.label)!, url: str(raw.secondaryCta.url) };
  }

  const image = parseMedia(raw.image);
  if (image.issue) warnings.push(image.value ? image.issue : `${image.issue}; showing placeholder`);

  return {
    value: {
      eyebrow,
      name,
      designation,
      roles,
      description,
      primaryCta,
      secondaryCta,
      location,
      image: image.value,
    },
    warnings,
  };
}

export function parseStatistic(id: string, raw: unknown): Parsed<ImpactStatistic> {
  if (!isRecord(raw)) return fail("document is not an object");
  // Allow numeric values (e.g. 2016) as well as strings ("23+").
  const value = typeof raw.value === "number" ? String(raw.value) : str(raw.value);
  const title = str(raw.title);
  const order = num(raw.order);
  if (!value) return fail("value is required");
  if (!title) return fail("title is required");
  if (order === undefined) return fail("order must be a number");
  if (typeof raw.active !== "boolean") return fail("active must be true or false");
  const iconImage = parseMedia(raw.iconImage, "iconImage");

  return {
    value: {
      id,
      value,
      title,
      description: str(raw.description),
      order,
      active: raw.active,
      // Unknown names fall back to the position's default icon in ImpactStats.
      icon: str(raw.icon) as IconName | undefined,
      iconImage: iconImage.value?.url ? iconImage.value : undefined,
    },
    warnings: iconImage.issue ? [iconImage.issue] : [],
  };
}

/** Active statistics only, sorted by `order` (ties keep document-id order for stability). */
export function selectActiveStatistics(stats: ImpactStatistic[]): ImpactStatistic[] {
  return stats
    .filter((s) => s.active)
    .sort((a, b) => a.order - b.order || (a.id ?? "").localeCompare(b.id ?? ""));
}
