import type { Metadata } from "next";
import { getInsights, getSiteSettings } from "@/lib/content";
import { InsightsSection } from "@/components/home/InsightsSection";
import { breadcrumbLd, getSiteUrl, pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

export async function generateMetadata(): Promise<Metadata> {
  const { sections } = await getSiteSettings();
  return pageMetadata({
    title: sections.insights.heading,
    description: sections.insights.intro || "Articles by Nisha Krishnan on business, entrepreneurship and growth.",
    path: "/insights",
  });
}

/** Every published article, newest first, in the homepage's Insights layout. */
export default async function InsightsPage() {
  const [articles, { sections }] = await Promise.all([getInsights(), getSiteSettings()]);
  // The section's "view all" link would point at this page — omit it here.
  return (
    <>
      <JsonLd data={breadcrumbLd(await getSiteUrl(), [{ name: sections.insights.heading, path: "/insights" }])} />
      <InsightsSection items={articles} copy={{ ...sections.insights, cta: undefined }} headingAs="h1" />
    </>
  );
}
