/**
 * YouTube helpers. Videos are never downloaded or uploaded: the CMS stores the original URL and
 * the validated video id; the site shows the thumbnail and loads the player only on click.
 */

const ID = /^[A-Za-z0-9_-]{11}$/;
const HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"]);

/**
 * The video id of a YouTube URL, or null. Supports watch URLs (youtube.com/watch?v=), short
 * URLs (youtu.be/), Shorts (youtube.com/shorts/), embed URLs (youtube.com/embed/, youtube-nocookie.com)
 * and live URLs (youtube.com/live/).
 */
export function parseYouTubeId(input: string | undefined | null): string | null {
  if (!input) return null;
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.toLowerCase();
  let id: string | null = null;
  if (host === "youtu.be" || host === "www.youtu.be") {
    id = url.pathname.split("/")[1] ?? null;
  } else if (HOSTS.has(host)) {
    const [first, second] = url.pathname.split("/").filter(Boolean);
    if (first === "watch") id = url.searchParams.get("v");
    else if (first === "shorts" || first === "embed" || first === "live" || first === "v") id = second ?? null;
  }
  return id && ID.test(id) ? id : null;
}

export const isYouTubeUrl = (input: string | undefined | null) => parseYouTubeId(input) !== null;

/** Default thumbnail (always exists for a public video). */
export const youTubeThumbnail = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

/** Privacy-enhanced embed; autoplay is used only after the visitor clicked play. */
export const youTubeEmbedUrl = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
