import type { Metadata } from "next";
import { getPressArticles } from "@/lib/content";
import { PageIntro } from "@/components/layout/PageIntro";
import { PressGallery } from "@/components/press/PressGallery";

const TITLE = "In the Media";
const DESCRIPTION = "Stories, features, and moments captured across the media — newspaper clippings and press coverage of Nisha Krishnan.";

export const metadata: Metadata = {
  title: "Media & Press",
  description: DESCRIPTION,
  alternates: { canonical: "/media" },
  openGraph: { title: "Media & Press", description: DESCRIPTION, url: "/media" },
};

/** Published press articles (CMS: Media & Press). */
export default async function MediaPage() {
  const articles = await getPressArticles();
  return (
    <>
      <section className="section-y pb-0">
        <div className="container-site">
          <PageIntro label="Media & Press" title={TITLE} intro="Stories, features, and moments captured across the media." />
        </div>
      </section>
      <section className="section-y">
        <div className="container-site">
          <PressGallery articles={articles} />
        </div>
      </section>
    </>
  );
}
