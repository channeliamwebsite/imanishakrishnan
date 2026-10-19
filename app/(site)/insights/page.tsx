import type { Metadata } from "next";
import { getInsights, getSiteSettings } from "@/lib/content";
import { InsightsSection } from "@/components/home/InsightsSection";

export async function generateMetadata(): Promise<Metadata> {
  const { sections } = await getSiteSettings();
  return { title: sections.insights.heading, description: sections.insights.intro || undefined, alternates: { canonical: "/insights" } };
}

/** Every published article, newest first, in the homepage's Insights layout. */
export default async function InsightsPage() {
  const [articles, { sections }] = await Promise.all([getInsights(), getSiteSettings()]);
  // The section's "view all" link would point at this page — omit it here.
  return <InsightsSection items={articles} copy={{ ...sections.insights, cta: undefined }} headingAs="h1" />;
}
