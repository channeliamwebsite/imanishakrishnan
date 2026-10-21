import type { Metadata } from "next";
import type { HeroContent, Insight, MediaAsset, SocialLink, VideoItem } from "@/types/content";
import { getSiteSettings } from "@/lib/content";
import { resolveSiteUrl } from "@/lib/site-url";
import { youTubeThumbnail } from "@/lib/youtube";

/**
 * SEO helpers shared by the public pages: one metadata shape (title, description, canonical,
 * Open Graph, Twitter) and schema.org JSON-LD built only from published content. URLs use the
 * primary domain from resolveSiteUrl (NEXT_PUBLIC_SITE_URL, else Admin → Settings → SEO).
 */

export const PERSON_NAME = "Nisha Krishnan";
/** Verified association (hero / SEO copy: "founder of channeliam.com"; the work CTA links here). */
const CHANNELIAM = { name: "Channeliam", url: "https://channeliam.com" };

export async function getSiteUrl(): Promise<string> {
  return resolveSiteUrl((await getSiteSettings()).seo.siteUrl);
}

/**
 * Page metadata. Next.js replaces (does not merge) the root openGraph object, so every page sets
 * the full set here — with the page's own image, else the default share image from the CMS.
 * `path` is the canonical path; `absoluteTitle` skips the "| Nisha Krishnan" template.
 */
export async function pageMetadata({
  title,
  absoluteTitle,
  description,
  path,
  image,
  type = "website",
  openGraph,
}: {
  title?: string;
  absoluteTitle?: string;
  description?: string;
  path: string;
  image?: MediaAsset;
  type?: "website" | "article" | "profile";
  openGraph?: Record<string, unknown>;
}): Promise<Metadata> {
  const { seo } = await getSiteSettings();
  const share = image?.url ? image : seo.ogImage?.url ? seo.ogImage : undefined;
  const fullTitle = absoluteTitle ?? (title ? seo.titleTemplate.replace("%s", title) : seo.title);
  const images = share ? [{ url: share.url, alt: share.alt ?? fullTitle }] : undefined;
  return {
    // No title at all (homepage) keeps the root default; an explicit undefined would remove it.
    ...(absoluteTitle ? { title: { absolute: absoluteTitle } } : title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: { type, url: path, siteName: PERSON_NAME, title: fullTitle, description, images, ...openGraph },
    twitter: { card: share ? "summary_large_image" : "summary", title: fullTitle, description, images: images?.map((i) => i.url) },
  };
}

/* ------------------------------------------------------------------ */
/* JSON-LD                                                             */
/* ------------------------------------------------------------------ */

const personRef = (siteUrl: string) => ({ "@id": `${siteUrl}/#person` });

/** Homepage graph: WebSite, Person (with verified profiles) and the Channeliam organisation. */
export function siteGraph({
  siteUrl,
  hero,
  description,
  socialLinks,
}: {
  siteUrl: string;
  hero: HeroContent;
  description: string;
  socialLinks: SocialLink[];
}) {
  const sameAs = socialLinks.map((s) => s.url).filter((u) => /^https?:\/\//.test(u));
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: PERSON_NAME,
        inLanguage: "en",
        publisher: personRef(siteUrl),
      },
      {
        "@type": "Person",
        "@id": `${siteUrl}/#person`,
        name: PERSON_NAME,
        url: siteUrl,
        jobTitle: hero.designation || undefined,
        description,
        image: hero.image?.url || undefined,
        worksFor: { "@id": `${siteUrl}/#channeliam` },
        sameAs: sameAs.length ? sameAs : undefined,
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#channeliam`,
        name: CHANNELIAM.name,
        url: CHANNELIAM.url,
        founder: personRef(siteUrl),
      },
    ],
  };
}

/** Home › … › current page. `items` excludes Home; the last item is the current page. */
export function breadcrumbLd(siteUrl: string, items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...items].map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteUrl}${item.path === "/" ? "" : item.path}`,
    })),
  };
}

/** A published article (Article / BlogPosting). */
export function articleLd(siteUrl: string, article: Insight) {
  const url = `${siteUrl}/insights/${article.slug}`;
  const image = article.seo?.image?.url || article.coverImage?.url;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    mainEntityOfPage: url,
    url,
    headline: (article.seo?.title || article.title).slice(0, 110),
    description: article.seo?.description || article.excerpt || undefined,
    image: image || undefined,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    // Nisha's own articles point at the site's Person entity; a guest author gets their own.
    author:
      article.author && article.author.trim().toLowerCase() !== PERSON_NAME.toLowerCase()
        ? { "@type": "Person", name: article.author }
        : personRef(siteUrl),
    publisher: personRef(siteUrl),
    articleSection: article.category || undefined,
    keywords: article.tags?.length ? article.tags.join(", ") : undefined,
  };
}

/**
 * Published YouTube videos as an ItemList of VideoObjects. Google requires an upload date, so
 * only videos with a date set in the CMS are included (nothing is invented).
 */
export function videoListLd(siteUrl: string, path: string, videos: VideoItem[]) {
  const dated = videos.filter((v) => v.date && !Number.isNaN(Date.parse(v.date)));
  if (dated.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    url: `${siteUrl}${path}`,
    itemListElement: dated.map((v, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "VideoObject",
        name: v.title,
        description: v.description || v.title,
        thumbnailUrl: v.thumbnail?.url || youTubeThumbnail(v.videoId),
        uploadDate: v.date,
        contentUrl: `https://www.youtube.com/watch?v=${v.videoId}`,
        embedUrl: `https://www.youtube.com/embed/${v.videoId}`,
      },
    })),
  };
}
