import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { WorkDetailContent } from "@/lib/content";
import { SECTION_IDS, sectionHref } from "@/lib/sections";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { MediaImage } from "@/components/ui/Image";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** External destinations open in a new tab, safely. */
const linkProps = (href: string) =>
  /^https?:\/\//i.test(href) ? { target: "_blank", rel: "noopener noreferrer" } : {};

/**
 * Detail page of a Selected Work item (/work/{slug}). Same editorial system as /about: page
 * header with the burgundy rule, section rules, SectionHeading, figure typography for numbers.
 * Every block renders only when its content exists.
 */
export function WorkDetailView({ item, expertise, milestones, copy }: WorkDetailContent) {
  const { detail } = item;
  const title = detail?.title ?? item.title;
  const eyebrow = [item.category, item.tagline].filter(Boolean).join(" · ");
  const gallery = item.gallery ?? [];
  const backHref = sectionHref(SECTION_IDS.impact);

  return (
    <>
      {/* Hero */}
      <section className="section-y pb-0">
        <div className="container-site">
          <Reveal>
            <Link
              href={backHref}
              className="type-button inline-flex items-center gap-2 text-burgundy transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" aria-hidden /> {copy.backLabel}
            </Link>
            {eyebrow && <p className="type-label mt-8 text-rose">{eyebrow}</p>}
            <h1 className="type-h1 mt-4 text-foreground">{title}</h1>
            <span aria-hidden className="mt-6 block h-0.5 w-16 bg-burgundy" />
            <p className="type-lead mt-6 max-w-[48rem] text-foreground/85">{item.description}</p>
          </Reveal>
        </div>
      </section>

      {/* Featured image — the card's cover at the same 7:3 proportion (placeholder frame until uploaded). */}
      <section className="section-y">
        <div className="container-site">
          <Reveal>
            <MediaImage media={item.coverImage} ratio="7/3" sizes="(min-width: 1360px) 1280px, 100vw" preload />
          </Reveal>
        </div>
      </section>

      {/* About */}
      {detail?.paragraphs && (
        <section className="pb-section">
          <div className="container-site">
            <div className="section-rule">
              <Reveal>
                <SectionHeading label={copy.aboutLabel} title={detail.aboutHeading ?? title} />
              </Reveal>
              <div className="prose-editorial type-body max-w-[46rem] text-foreground/80">
                {detail.paragraphs.map((p, i) => (
                  <Reveal key={i} delay={Math.min(i, 3) * 0.05}>
                    <p>{p}</p>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Key figures */}
      {detail?.highlights && (
        <section className="pb-section">
          <div className="container-site">
            <div className="section-rule">
              <Reveal>
                <SectionHeading title={copy.highlightsLabel} />
              </Reveal>
              <ul className="grid grid-cols-2 gap-y-8 md:grid-cols-3">
                {detail.highlights.map((h, i) => (
                  <li
                    key={i}
                    className={cn(
                      "hairline min-w-0",
                      i % 2 === 1 ? "border-l pl-4 xs:pl-6" : "pr-4 xs:pr-6",
                      "md:border-l-0 md:px-0 md:[&:not(:first-child)]:border-l md:[&:not(:first-child)]:pl-8",
                    )}
                  >
                    <Reveal delay={i * 0.08}>
                      <p className="type-figure text-[clamp(1.875rem,7.5vw,2.25rem)] leading-none text-burgundy md:text-[clamp(2.25rem,3.2vw,2.875rem)]">
                        {h.value}
                      </p>
                      <p className="type-caps mt-3 text-foreground">{h.label}</p>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* The work — the referenced area of expertise */}
      {expertise && (
        <section className="pb-section">
          <div className="container-site">
            <div className="section-rule">
              <Reveal>
                <SectionHeading label={copy.workLabel} title={expertise.title} />
              </Reveal>
              <div className="prose-editorial type-body max-w-[46rem] text-foreground/80">
                <Reveal>
                  <p>{expertise.description}</p>
                </Reveal>
                {expertise.details?.map((p, i) => (
                  <Reveal key={i} delay={Math.min(i + 1, 3) * 0.05}>
                    <p>{p}</p>
                  </Reveal>
                ))}
              </div>
              {expertise.strengths && (
                <Reveal className="mt-10 max-w-[46rem] border-l-2 border-burgundy pl-6 md:pl-8">
                  <p className="type-label text-rose">{copy.strengthsLabel}</p>
                  <p className="type-body mt-3 text-foreground/80">{expertise.strengths}</p>
                </Reveal>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Journey & impact — the same timeline entries as the homepage and /about */}
      {milestones.length > 0 && (
        <section className="pb-section">
          <div className="container-site">
            <div className="section-rule">
              <Reveal>
                <SectionHeading title={copy.milestonesLabel} />
              </Reveal>
              <ol className="relative max-w-[46rem]">
                {milestones.map((entry, i) => {
                  const vision = entry.kind === "vision";
                  const last = i === milestones.length - 1;
                  return (
                    <li key={entry.id} className="relative pb-10 pl-9 last:pb-0">
                      {!last && (
                        <span
                          aria-hidden
                          className={cn(
                            "absolute bottom-0 left-0 top-[0.6rem] w-px",
                            milestones[i + 1]?.kind === "vision" ? "border-l border-dashed border-rose/60" : "bg-burgundy/60",
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
                        <p className={cn("type-figure text-[1.125rem] leading-tight", vision ? "text-rose" : "text-burgundy")}>
                          {entry.year}
                          {vision && <span className="type-label ml-3 align-middle text-rose">Vision</span>}
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
      )}

      {/* Gallery — uploaded images only */}
      {gallery.length > 0 && (
        <section className="pb-section">
          <div className="container-site">
            <div className="section-rule">
              <Reveal>
                <SectionHeading title={copy.galleryLabel} />
              </Reveal>
              <ul className="grid gap-card sm:grid-cols-2 lg:grid-cols-3">
                {gallery.map((media, i) => (
                  <li key={media.publicId || i}>
                    <Reveal delay={Math.min(i, 3) * 0.06}>
                      <MediaImage media={media} ratio="intrinsic" sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" />
                    </Reveal>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Call to action — the external site opens only from here */}
      <section className="pb-section">
        <div className="container-site">
          <div className="section-rule">
            <Reveal className="flex flex-wrap items-center gap-6">
              {detail?.cta && (
                <Button href={detail.cta.href} {...linkProps(detail.cta.href)}>
                  {detail.cta.label}
                </Button>
              )}
              <Button href={backHref} variant="text" icon="none">
                {copy.backLabel}
              </Button>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
