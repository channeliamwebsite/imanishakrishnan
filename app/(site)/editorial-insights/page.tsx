import type { Metadata } from "next";
import { getEditorialVideos } from "@/lib/content";
import { PageIntro } from "@/components/layout/PageIntro";
import { VideoGallery } from "@/components/video/VideoGallery";

const SUBTITLE = "Perspectives, conversations, and ideas shaping business, entrepreneurship, leadership, and growth.";

export const metadata: Metadata = {
  title: "Editorial Insights",
  description: `${SUBTITLE} Editorials, commentary and interviews by Nisha Krishnan.`,
  alternates: { canonical: "/editorial-insights" },
  openGraph: { title: "Editorial Insights", description: SUBTITLE, url: "/editorial-insights" },
};

const CATEGORIES = [
  { value: "editorial" as const, label: "Editorials" },
  { value: "business" as const, label: "Business" },
  { value: "entrepreneurship" as const, label: "Entrepreneurship" },
  { value: "leadership" as const, label: "Leadership" },
  { value: "innovation" as const, label: "Innovation" },
  { value: "interview" as const, label: "Interviews" },
];

/** Published YouTube editorials (CMS: Editorial Insights). Players load only when a video is played. */
export default async function EditorialInsightsPage() {
  const videos = await getEditorialVideos();
  return (
    <>
      <section className="section-y pb-0">
        <div className="container-site">
          <PageIntro label="Editorials · Commentary · Interviews" title="Editorial Insights" intro={SUBTITLE} />
        </div>
      </section>
      <section className="section-y">
        <div className="container-site">
          <VideoGallery
            videos={videos}
            categories={CATEGORIES}
            allTitle="The Collection"
            emptyText="Editorial videos will appear here once they are published."
            showDescriptions
          />
        </div>
      </section>
    </>
  );
}
