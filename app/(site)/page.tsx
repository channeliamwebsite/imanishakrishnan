import { getHomeContent, getSiteSettings } from "@/lib/content";
import { Hero } from "@/components/home/Hero";
import { ImpactStats } from "@/components/home/ImpactStats";
import { AboutSection } from "@/components/home/AboutSection";
import { WorkSection } from "@/components/home/WorkSection";
import { MediaSection } from "@/components/home/MediaSection";
import { PhilosophySection } from "@/components/home/PhilosophySection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { InsightsSection } from "@/components/home/InsightsSection";
import { siteSettings as fallbackSettings } from "@/lib/content/placeholder";

export default async function HomePage() {
  const [content, { sections }] = await Promise.all([getHomeContent(), getSiteSettings()]);

  return (
    <>
      <Hero content={content.hero} />
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
