import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ProfileContent, RecognitionItem } from "@/types/content";
import { getAbout } from "@/lib/content";
import { profile as fallbackProfile } from "@/lib/content/profile";
import { PROFILE_PATH } from "@/lib/content/placeholder";
import { isCloudinaryUrl } from "@/lib/cloudinary/url";
import { Reveal } from "@/components/ui/Reveal";
import { AwardsShowcase } from "@/components/awards/AwardsShowcase";

const TITLE = "Awards & Recognition";
const DESCRIPTION = "Explore the awards, achievements, and recognitions of Nisha Krishnan.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/awards" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/awards" },
};

const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const num = (n: number) => String(n).padStart(2, "0");

/**
 * A gallery image without its own description borrows the one written for the same award in the
 * awards list (Admin → Awards) — existing content only, matched by title.
 */
function withArchiveDescriptions(items: RecognitionItem[], achievements: ProfileContent["achievements"]): RecognitionItem[] {
  const archive = new Map(
    achievements.groups.flatMap((g) => g.items).filter((a) => a.description).map((a) => [normalise(a.title), a.description]),
  );
  return items.map((item) =>
    item.description || !item.title ? item : { ...item, description: archive.get(normalise(item.title)) || undefined },
  );
}

/**
 * Awards & Recognition. Images come from the /about Recognition gallery and the complete record
 * from the awards list (about/main → profile.achievements, managed in Admin → Awards) — nothing
 * here is separate award data.
 */
export default async function AwardsPage() {
  const about = await getAbout();
  const achievements = (about.profile ?? fallbackProfile).achievements;
  const items = withArchiveDescriptions(
    (achievements.gallery ?? []).filter((g) => g.published !== false && isCloudinaryUrl(g.image.url)),
    achievements,
  );
  const record = achievements.groups.filter((g) => g.items.length > 0);

  return (
    <>
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

      {/* ── Featured recognition and the gallery ── */}
      <section className="pb-section">
        <div className="container-site border-t hairline pt-12 lg:pt-16">
          {items.length > 0 ? (
            <AwardsShowcase items={items} />
          ) : (
            <p className="type-body text-muted">Award images will appear here once they are added.</p>
          )}
        </div>
      </section>

      {/* ── The complete record: every award, with or without an image ── */}
      {record.length > 0 && (
        <section className="pb-section">
          <div className="container-site">
            <div className="border-t hairline pt-12 lg:pt-16">
              <Reveal>
                <p className="type-label text-rose">The Complete Record</p>
                <h2 className="type-h3 mt-3 text-foreground">{achievements.heading}</h2>
              </Reveal>
              <div className="mt-10 grid gap-x-grid gap-y-10 md:grid-cols-2">
                {record.map((group, g) => {
                  const offset = record.slice(0, g).reduce((sum, prev) => sum + prev.items.length, 0);
                  return (
                    <div key={g}>
                      <h3 className="type-caps flex items-center gap-4 text-rose">
                        {group.heading}
                        <span aria-hidden className="block h-px flex-1 bg-rose/25" />
                      </h3>
                      <ol className="mt-5 divide-y hairline">
                        {group.items.map((a, i) => (
                          <li key={i} className="flex items-baseline gap-5 py-3.5">
                            <span className="type-figure w-7 shrink-0 text-base text-burgundy/70">{num(offset + i + 1)}</span>
                            <span className="type-h4 text-foreground">{a.title}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
