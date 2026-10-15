import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAbout } from "@/lib/content";
import { profile as fallbackProfile } from "@/lib/content/profile";
import { PROFILE_PATH } from "@/lib/content/placeholder";
import { isCloudinaryUrl } from "@/lib/cloudinary/url";
import { Reveal } from "@/components/ui/Reveal";
import { AwardsGallery } from "@/components/awards/AwardsGallery";

const TITLE = "Awards & Recognition";
const DESCRIPTION = "Explore the awards, achievements, and recognitions of Nisha Krishnan.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/awards" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/awards" },
};

/**
 * Awards gallery. Reuses the /about Recognition images (about/main → profile.achievements.gallery,
 * managed in the admin) — no separate awards data.
 */
export default async function AwardsPage() {
  const about = await getAbout();
  const achievements = (about.profile ?? fallbackProfile).achievements;
  const items = (achievements.gallery ?? []).filter((g) => g.published !== false && isCloudinaryUrl(g.image.url));

  return (
    <>
      <section className="section-y pb-0">
        <div className="container-site">
          <Reveal>
            <Link
              href={`${PROFILE_PATH}#awards`}
              className="type-button inline-flex min-h-11 items-center gap-2 text-burgundy transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" aria-hidden /> Back to Profile
            </Link>
            <p className="type-label mt-8 text-rose">Recognition</p>
            <h1 className="type-h1 mt-4 text-foreground">{TITLE}</h1>
            <span aria-hidden className="mt-6 block h-0.5 w-16 bg-burgundy" />
            <p className="type-lead mt-6 max-w-[48rem] text-foreground/85">
              Awards, certificates and moments of recognition from Nisha Krishnan&rsquo;s work in journalism, media and
              entrepreneurship.
            </p>
            {achievements.tagline && <p className="type-meta mt-4 text-muted">{achievements.tagline}</p>}
          </Reveal>
        </div>
      </section>
      <section className="section-y">
        <div className="container-site">
          {items.length > 0 ? (
            <AwardsGallery items={items} />
          ) : (
            <p className="type-body text-muted">Award images will appear here once they are added.</p>
          )}
        </div>
      </section>
    </>
  );
}
