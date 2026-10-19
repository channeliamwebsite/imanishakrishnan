import type { MetadataRoute } from "next";
import { getInsights, getSiteSettings, getWorkDetailSlugs } from "@/lib/content";
import { resolveSiteUrl } from "@/lib/site-url";

const PAGES = [
  "/",
  "/about",
  "/awards",
  "/media",
  "/videos",
  "/editorial-insights",
  "/ecosystem-enabler",
  "/insights",
  "/testimonials",
  "/privacy",
  "/terms",
];

/** /sitemap.xml — the public pages, published articles and work detail pages. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [settings, insights, workSlugs] = await Promise.all([getSiteSettings(), getInsights(), getWorkDetailSlugs()]);
  const siteUrl = resolveSiteUrl(settings.seo.siteUrl);
  return [
    ...PAGES.map((path) => ({ url: `${siteUrl}${path === "/" ? "" : path}` })),
    ...workSlugs.map((slug) => ({ url: `${siteUrl}/work/${slug}` })),
    ...insights.map((a) => ({ url: `${siteUrl}/insights/${a.slug}`, lastModified: a.publishedAt })),
  ];
}
