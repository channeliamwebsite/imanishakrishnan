/**
 * Cloudinary folder layout for site media. Constants only — folders are created by
 * Cloudinary on first upload into them; application code never creates folders.
 *
 * nisha-krishnan/
 * ├── hero/  profile/  timeline/
 * ├── work/{channeliam, she-power, startup-studio, advisory}/
 * ├── achievements/  media/  speaking/  insights/  testimonials/
 * └── statistics/  logos/  site/
 */
export const CLOUDINARY_ROOT_FOLDER = "nisha-krishnan";

const folder = (path: string) => `${CLOUDINARY_ROOT_FOLDER}/${path}`;

export const CLOUDINARY_FOLDERS = {
  hero: folder("hero"),
  profile: folder("profile"),
  timeline: folder("timeline"),
  work: {
    channeliam: folder("work/channeliam"),
    shePower: folder("work/she-power"),
    startupStudio: folder("work/startup-studio"),
    advisory: folder("work/advisory"),
    /** Cover images of initiatives added through the admin. */
    covers: folder("work/covers"),
  },
  achievements: folder("achievements"),
  media: folder("media"),
  speaking: folder("speaking"),
  insights: folder("insights"),
  testimonials: folder("testimonials"),
  /** Statistic icons. */
  statistics: folder("statistics"),
  /** Organisation and publication logos. */
  logos: folder("logos"),
  /** Branding and SEO images (share image, etc.). */
  site: folder("site"),
} as const;

type Leaves<T> = T extends string ? T : { [K in keyof T]: Leaves<T[K]> }[keyof T];
export type CloudinaryFolder = Leaves<typeof CLOUDINARY_FOLDERS>;

const ALL_FOLDERS = new Set<string>(
  Object.values(CLOUDINARY_FOLDERS).flatMap((v) => (typeof v === "string" ? [v] : Object.values(v))),
);

/** Uploads (from the future admin) may only target these folders. */
export function isAllowedFolder(value: string): value is CloudinaryFolder {
  return ALL_FOLDERS.has(value);
}
