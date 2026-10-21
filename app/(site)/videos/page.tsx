import type { Metadata } from "next";
import { getVideos } from "@/lib/content";
import { PageIntro } from "@/components/layout/PageIntro";
import { VideoGallery } from "@/components/video/VideoGallery";
import { breadcrumbLd, getSiteUrl, pageMetadata, videoListLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

const DESCRIPTION = "Conversations, ideas, and moments worth sharing — talks, interviews and panel discussions featuring Nisha Krishnan.";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata({ title: "Videos — Talks, Interviews & Panel Discussions", description: DESCRIPTION, path: "/videos" });
}

/** Published YouTube videos (CMS: Video Gallery). Players load only when a video is played. */
export default async function VideosPage() {
  const [videos, siteUrl] = await Promise.all([getVideos(), getSiteUrl()]);
  return (
    <>
      <JsonLd data={breadcrumbLd(siteUrl, [{ name: "Videos", path: "/videos" }])} />
      <JsonLd data={videoListLd(siteUrl, "/videos", videos)} />
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
