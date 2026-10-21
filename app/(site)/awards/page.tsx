import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAbout } from "@/lib/content";
import { profile as fallbackProfile } from "@/lib/content/profile";
import { PROFILE_PATH } from "@/lib/content/placeholder";
import { isCloudinaryUrl } from "@/lib/cloudinary/url";
import { Reveal } from "@/components/ui/Reveal";
import { AwardsShowcase } from "@/components/awards/AwardsShowcase";
import { breadcrumbLd, getSiteUrl, pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

const TITLE = "Awards & Recognition";
const DESCRIPTION =
  "Awards and honours received by journalist Nisha Krishnan, including the Laadli Media Award, the Kerala State Media Award and the Dr. B. R. Ambedkar Award.";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata({ title: TITLE, description: DESCRIPTION, path: "/awards" });
}

/**
 * Awards & Recognition: a visual showcase of the award images from the /about Recognition gallery
 * (about/main → profile.achievements.gallery, managed in Admin → Awards). The written list of
 * awards lives on /about, so it is not repeated here.
 */
export default async function AwardsPage() {
  const about = await getAbout();
  const achievements = (about.profile ?? fallbackProfile).achievements;
  const items = (achievements.gallery ?? []).filter((g) => g.published !== false && isCloudinaryUrl(g.image.url));

  return (
    <>
      <JsonLd data={breadcrumbLd(await getSiteUrl(), [{ name: TITLE, path: "/awards" }])} />
      {/* ── Hero ── */}
      <section className="pb-12 pt-[clamp(2.5rem,5vw,4.5rem)] lg:pb-16">
        <div className="container-site">
          <Reveal>
            <Link
              href={`${PROFILE_PATH}#awards`}
              className="type-button inline-flex min-h-11 items-center gap-2 text-burgundy transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" aria-hidden /> Back to Profile
            </Link>
            <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-16">
              <div className="lg:col-span-7">
                <p className="type-label flex items-center gap-4 text-rose">
                  Recognition
                  <span aria-hidden className="block h-px w-12 bg-rose/50" />
                </p>
                <h1 className="type-h1 mt-5 text-foreground">{TITLE}</h1>
              </div>
              <div className="lg:col-span-5 lg:pb-2">
                <span aria-hidden className="block h-0.5 w-16 bg-burgundy" />
                <p className="type-lead mt-6 text-foreground/80">
                  Awards, certificates and moments of recognition from Nisha Krishnan&rsquo;s work in journalism, media
                  and entrepreneurship.
                </p>
                {achievements.tagline && <p className="type-meta mt-4 text-muted">{achievements.tagline}</p>}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── The gallery ── */}
      <section className="pb-section">
        <div className="container-site border-t hairline pt-10 lg:pt-14">
          {items.length > 0 ? (
            <AwardsShowcase items={items} />
          ) : (
            <p className="type-body text-muted">Award images will appear here once they are added.</p>
          )}
        </div>
      </section>

    </>
  );
}
