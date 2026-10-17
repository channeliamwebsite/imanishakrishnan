import type { Metadata } from "next";
import { getVideos } from "@/lib/content";
import { PageIntro } from "@/components/layout/PageIntro";
import { VideoGallery } from "@/components/video/VideoGallery";

const DESCRIPTION = "Conversations, ideas, and moments worth sharing — talks, interviews and panel discussions featuring Nisha Krishnan.";

export const metadata: Metadata = {
  title: "Video Gallery",
  description: DESCRIPTION,
  alternates: { canonical: "/videos" },
  openGraph: { title: "Video Gallery", description: DESCRIPTION, url: "/videos" },
};

/** Published YouTube videos (CMS: Video Gallery). Players load only when a video is played. */
export default async function VideosPage() {
  const videos = await getVideos();
  return (
    <>
      <section className="section-y pb-0">
        <div className="container-site">
          <PageIntro label="Video Gallery" title="Watch & Listen" intro="Conversations, ideas, and moments worth sharing." />
        </div>
      </section>
      <section className="section-y">
        <div className="container-site">
          <VideoGallery videos={videos} />
        </div>
      </section>
    </>
  );
}
