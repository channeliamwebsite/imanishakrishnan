import type { Metadata } from "next";
import { getAvatarVideo, getHomeContent, getSiteSettings, getSocialLinks } from "@/lib/content";
import { resolveSiteUrl } from "@/lib/site-url";
import { Hero } from "@/components/home/Hero";
import { ImpactStats } from "@/components/home/ImpactStats";
import { AboutSection } from "@/components/home/AboutSection";
import { WorkSection } from "@/components/home/WorkSection";
import { MediaSection } from "@/components/home/MediaSection";
import { PhilosophySection } from "@/components/home/PhilosophySection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { InsightsSection } from "@/components/home/InsightsSection";
import { siteSettings as fallbackSettings } from "@/lib/content/placeholder";

export const metadata: Metadata = { alternates: { canonical: "/" } };

/** "<" as a JSON unicode escape (backslash + u003c), so JSON-LD content can never close its script tag. */
const LT_ESCAPE = String.fromCharCode(92) + "u003c";

export default async function HomePage() {
  const [content, { sections, seo }, avatar, socialLinks] = await Promise.all([
    getHomeContent(),
    getSiteSettings(),
    getAvatarVideo(),
    getSocialLinks(),
  ]);

  // Structured data (schema.org Person) from published content only.
  const siteUrl = resolveSiteUrl(seo.siteUrl);
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: content.hero.name.replace(/^i\s*(?:am|['’]m)\s+/i, "").trim(),
    jobTitle: content.hero.designation,
    description: seo.description,
    url: siteUrl,
    image: content.hero.image?.url,
    sameAs: socialLinks.filter((s) => /^https?:\/\//.test(s.url)).map((s) => s.url),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // JSON.stringify output with "<" escaped, so content can never close the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(person).replace(/</g, LT_ESCAPE) }}
      />
      <Hero content={content.hero} avatar={avatar} />
      <ImpactStats items={content.statistics} />
      <AboutSection content={content.about} timeline={content.timeline} />
      <WorkSection items={content.work} copy={sections.work} />
      <MediaSection items={content.mediaFeatures} copy={sections.media} />
      <PhilosophySection content={content.philosophy} />
      <TestimonialsSection copy={sections.testimonials ?? fallbackSettings.sections.testimonials!} />
      <InsightsSection items={content.insights} copy={sections.insights} />
    </>
  );
}
