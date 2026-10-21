import type { Metadata } from "next";
import { getPressArticles } from "@/lib/content";
import { PageIntro } from "@/components/layout/PageIntro";
import { PressGallery } from "@/components/press/PressGallery";
import { breadcrumbLd, getSiteUrl, pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

const TITLE = "In the Media";
const DESCRIPTION =
  "Newspaper and online coverage of journalist and media entrepreneur Nisha Krishnan — features, interviews and press clippings.";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata({ title: "Media Coverage & Press", description: DESCRIPTION, path: "/media" });
}

/** Published press articles (CMS: Media & Press). */
export default async function MediaPage() {
  const articles = await getPressArticles();
  return (
    <>
      <JsonLd data={breadcrumbLd(await getSiteUrl(), [{ name: "Media Coverage & Press", path: "/media" }])} />
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
