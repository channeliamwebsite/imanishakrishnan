import type { Metadata } from "next";
import { getAvatarVideo, getHomeContent, getSiteSettings, getSocialLinks } from "@/lib/content";
import { resolveSiteUrl } from "@/lib/site-url";
import { pageMetadata, siteGraph } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Hero } from "@/components/home/Hero";
import { ImpactStats } from "@/components/home/ImpactStats";
import { AboutSection } from "@/components/home/AboutSection";
import { WorkSection } from "@/components/home/WorkSection";
import { MediaSection } from "@/components/home/MediaSection";
import { PhilosophySection } from "@/components/home/PhilosophySection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { InsightsSection } from "@/components/home/InsightsSection";
import { siteSettings as fallbackSettings } from "@/lib/content/placeholder";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getSiteSettings();
  return pageMetadata({ description: seo.description, path: "/" });
}

export default async function HomePage() {
  const [content, { sections, seo }, avatar, socialLinks] = await Promise.all([
    getHomeContent(),
    getSiteSettings(),
    getAvatarVideo(),
    getSocialLinks(),
  ]);

  // Structured data (WebSite, Person, Organization) from published content only.
  const graph = siteGraph({ siteUrl: resolveSiteUrl(seo.siteUrl), hero: content.hero, description: seo.description, socialLinks });

  return (
    <>
      <JsonLd data={graph} />
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
