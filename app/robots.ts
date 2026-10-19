import type { MetadataRoute } from "next";
import { getSiteSettings } from "@/lib/content";
import { resolveSiteUrl } from "@/lib/site-url";

/** /robots.txt — the admin and the CMS preview are never indexed (they also send X-Robots-Tag). */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteUrl = resolveSiteUrl((await getSiteSettings()).seo.siteUrl);
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/preview"] }],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
