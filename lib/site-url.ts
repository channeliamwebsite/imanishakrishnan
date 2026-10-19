/**
 * The site's canonical origin, from one place: NEXT_PUBLIC_SITE_URL (set it in Vercel when the
 * custom domain goes live) overrides the "Site URL" saved in Admin → Settings → SEO. Used for
 * metadataBase (canonical and Open Graph URLs), the sitemap, robots.txt and structured data.
 */
export function resolveSiteUrl(cmsSiteUrl: string): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const url = fromEnv && /^https?:\/\/[^\s/]+/i.test(fromEnv) ? fromEnv : cmsSiteUrl;
  return url.replace(/\/+$/, "");
}
