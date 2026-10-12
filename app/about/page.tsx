import type { Metadata } from "next";
import { Fragment } from "react";
import { getAbout, getTimeline } from "@/lib/content";
import { profile as fallbackProfile } from "@/lib/content/profile";
import { cn } from "@/lib/cn";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "About",
  description:
    "Biography, career milestones, professional achievements, areas of expertise and leadership philosophy of Nisha Krishnan — journalist, media entrepreneur and founder of channeliam.com.",
};

/** Small numbered marker used for achievements and expertise. */
const num = (n: number) => String(n).padStart(2, "0");

/**
 * The full profile (from about/main → profile, falling back to the approved workbook content).
 * Long-form material that would overcrowd the homepage: detailed bio, all 12 milestones with
 * descriptions, the 12 achievements, the 11 areas of expertise and the leadership philosophy.
 */
export default async function AboutPage() {
  const [about, timeline] = await Promise.all([getAbout(), getTimeline()]);
  const profile = about.profile ?? fallbackProfile;

  return (
    <>
      {/* Header */}
      <section className="section-y pb-0">
        <div className="container-site">
          <Reveal>
            <p className="type-label text-rose">Profile</p>
            <h1 className="type-h1 mt-4 text-foreground">Nisha Krishnan</h1>
            <span aria-hidden className="mt-6 block h-0.5 w-16 bg-burgundy" />
            <p className="type-lead mt-6 max-w-[48rem] text-foreground/85">{profile.tagline}</p>
          </Reveal>
        </div>
      </section>

      {/* Biography */}
      <section id="biography" className="section-y">
        <div className="container-site">
          <Reveal>
            <SectionHeading label="Biography" title="A journey built on stories." />
          </Reveal>
          <div className="prose-editorial type-body max-w-[46rem] text-foreground/80">
            {profile.detailedBio.map((p, i) => (
              <Reveal key={i} delay={Math.min(i, 3) * 0.05}>
                <p>{p}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Career milestones — the homepage rail's entries, with their full descriptions */}
      <section id="milestones" className="pb-section">
        <div className="container-site">
          <div className="section-rule">
            <Reveal>
              <SectionHeading label="Career Journey" title="Key milestones" intro="From broadcast journalism to media entrepreneurship." />
            </Reveal>
            <ol className="relative max-w-[46rem]">
              {timeline.map((entry, i) => {
                const vision = entry.kind === "vision";
                const last = i === timeline.length - 1;
                return (
                  <li key={entry.id} className="relative pb-10 pl-9 last:pb-0">
                    {!last && (
                      <span
                        aria-hidden
                        className={cn(
                          "absolute bottom-0 left-0 top-[0.6rem] w-px",
                          timeline[i + 1]?.kind === "vision" ? "border-l border-dashed border-rose/60" : "bg-burgundy/60",
                        )}
                      />
                    )}
                    <span
                      aria-hidden
                      className={cn(
                        "absolute left-0 top-[0.45rem] size-[7px] -translate-x-[3px] rounded-full",
                        vision ? "border border-rose bg-background" : "bg-burgundy",
                      )}
                    />
                    <Reveal y={10}>
                      <p className={cn("font-serif text-[1.1875rem] font-semibold leading-tight", vision ? "italic text-rose" : "text-burgundy")}>
                        {entry.year}
                        {vision && <span className="type-label ml-3 align-middle not-italic text-rose">Vision</span>}
                      </p>
                      <h3 className="type-h4 mt-1 text-foreground">{entry.title}</h3>
                      {entry.description && <p className="type-small mt-2 text-muted">{entry.description}</p>}
                    </Reveal>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section id="achievements" className="pb-section">
        <div className="container-site">
          <div className="section-rule">
            <Reveal>
              <SectionHeading label="Recognition" title={profile.achievements.heading} intro={profile.achievements.tagline} />
            </Reveal>
            {profile.achievements.groups.map((group, g) => {
              // Continuous numbering across groups (01–12).
              const offset = profile.achievements.groups.slice(0, g).reduce((sum, prev) => sum + prev.items.length, 0);
              return (
                <div key={group.heading} className="mt-10 first:mt-0">
                  <h3 className="type-caps text-rose">{group.heading}</h3>
                  <ul className="mt-6 grid gap-x-grid gap-y-8 md:grid-cols-2">
                    {group.items.map((a, i) => (
                      <li key={a.title} className="border-t hairline pt-5">
                        <Reveal y={10} className="flex gap-5">
                          <span className="font-display text-[1.75rem] leading-none text-burgundy/70">{num(offset + i + 1)}</span>
                          <div>
                            <h4 className="type-h4 text-foreground">{a.title}</h4>
                            <p className="type-small mt-2 text-muted">{a.description}</p>
                          </div>
                        </Reveal>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Areas of expertise */}
      <section id="expertise" className="pb-section">
        <div className="container-site">
          <div className="section-rule">
            <Reveal>
              <SectionHeading label={profile.expertise.subtitle} title={profile.expertise.heading} />
            </Reveal>
            <div className="prose-editorial type-body max-w-[46rem] text-foreground/80">
              {profile.expertise.intro.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <ul className="mt-12 grid gap-x-grid gap-y-12 md:grid-cols-2">
              {profile.expertise.items.map((x, i) => (
                <li key={x.title} id={x.anchor} className="border-t hairline pt-6">
                  <Reveal y={10}>
                    <p className="font-display text-[1.75rem] leading-none text-burgundy/70">{num(i + 1)}</p>
                    <h3 className="type-h4 mt-3 text-foreground">{x.title}</h3>
                    <p className="type-small mt-2 text-foreground/80">{x.description}</p>
                    {x.details?.map((d, j) => (
                      <p key={j} className="type-small mt-3 text-muted">
                        {d}
                      </p>
                    ))}
                    {x.strengths && (
                      <p className="type-small mt-4 text-muted">
                        <span className="type-label mr-2 text-rose">Core strengths</span>
                        {x.strengths}
                      </p>
                    )}
                  </Reveal>
                </li>
              ))}
            </ul>
            <Reveal className="mt-14 border-l-2 border-burgundy pl-6 md:pl-8">
              <h3 className="type-h3 text-foreground">{profile.expertise.distinctiveStrength.heading}</h3>
              <div className="prose-editorial type-body mt-4 max-w-[46rem] text-foreground/80">
                {profile.expertise.distinctiveStrength.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Leadership philosophy (first person) */}
      <section id="philosophy" className="bg-[linear-gradient(170deg,var(--dark-section)_0%,var(--dark-section-deep)_100%)] text-white">
        <div className="container-site section-y">
          <Reveal>
            <SectionHeading label="Leadership" title={profile.philosophy.heading} tone="inverse" />
          </Reveal>
          <div className="max-w-[46rem]">
            <Reveal>
              <p className="type-quote text-white">{profile.philosophy.subtitle}</p>
            </Reveal>
            <div className="prose-editorial type-body mt-8 text-white/80">
              {profile.philosophy.paragraphs.map((p, i) => (
                <Fragment key={i}>
                  <p>{p}</p>
                </Fragment>
              ))}
            </div>
            <p className="type-label mt-8 text-white/85">Nisha Krishnan</p>
          </div>
        </div>
      </section>
    </>
  );
}
