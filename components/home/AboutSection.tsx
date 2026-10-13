import type { AboutContent, TimelineEntry } from "@/types/content";
import { SECTION_IDS } from "@/lib/sections";
import { Button } from "@/components/ui/Button";
import { MediaImage } from "@/components/ui/Image";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Timeline } from "./Timeline";

/**
 * Reference composition (1440px): collage bleeds off the left edge (~33% of the viewport),
 * story column in the middle, compact timeline rail (~11rem) on the right with a full-height rule.
 * Tablet: collage beside the story, timeline below the story. Mobile: one column.
 * Everything reveals once on scroll; with reduced motion or no JavaScript it is simply visible.
 */
export function AboutSection({ content, timeline }: { content: AboutContent; timeline: TimelineEntry[] }) {
  const [primary, secondary] = content.images;

  return (
    <section id={SECTION_IDS.about} className="pb-section pt-[clamp(1.25rem,1.6vw,1.5rem)]">
      <div className="container-site grid gap-x-grid gap-y-12 md:grid-cols-2 lg:grid-cols-[31%_minmax(0,1fr)_11rem] lg:gap-x-8">
        {/* Collage */}
        <Reveal className="md:row-span-2 lg:row-span-1 lg:mr-5 lg:bleed-left">
          <div className="grid grid-cols-[47fr_53fr] gap-3">
            <MediaImage
              media={primary}
              ratio="8/5"
              sizes="(min-width: 1024px) 34vw, (min-width: 768px) 50vw, 100vw"
              className="col-span-2"
              imageClassName="grayscale"
            />
            {content.keywords && (
              <ul className="type-meta flex flex-col justify-end gap-2 pb-2 text-[0.625rem] tracking-[0.14em] whitespace-nowrap text-muted lg:pl-[var(--bleed)]">
                {content.keywords.map((word, i) => (
                  <li key={word}>
                    <Reveal delay={0.1 + i * 0.05} y={8}>
                      {word}
                    </Reveal>
                  </li>
                ))}
              </ul>
            )}
            {secondary && (
              <MediaImage
                media={secondary}
                ratio="14/15"
                sizes="(min-width: 1024px) 18vw, (min-width: 768px) 26vw, 52vw"
                className={content.keywords ? undefined : "col-start-2"}
                imageClassName="grayscale"
              />
            )}
          </div>
        </Reveal>

        {/* Story */}
        <div className="flex flex-col justify-center">
          <Reveal delay={0.05}>
            <SectionHeading label={content.label} title={content.heading} rule="below" className="max-w-[28rem]" />
          </Reveal>
          {content.intro && (
            <Reveal delay={0.1}>
              <p className="type-body mb-[var(--paragraph-gap)] max-w-[38rem] text-foreground/85">{content.intro}</p>
            </Reveal>
          )}
          <div className="prose-editorial type-body max-w-[38rem] text-foreground/80">
            {content.paragraphs.map((p, i) => (
              <Reveal key={i} delay={0.15 + i * 0.08}>
                <p>{p}</p>
              </Reveal>
            ))}
          </div>
          {/* Closing line (site copy, not an attributed quote) — in the reference's link position */}
          {content.closing && (
            <Reveal delay={0.15 + content.paragraphs.length * 0.08} className="mt-7">
              <p className="text-[clamp(1.0625rem,1.3vw,1.25rem)] font-semibold leading-snug text-burgundy">
                {content.closing}
              </p>
            </Reveal>
          )}
          {/* Link to the full profile (/about) — the reference's "Read more about Nisha" position */}
          {content.cta?.href && (
            <Reveal delay={0.2 + content.paragraphs.length * 0.08} className="mt-7 self-start">
              <Button href={content.cta.href} variant="text">
                {content.cta.label}
              </Button>
            </Reveal>
          )}
        </div>

        {/* Career timeline rail */}
        <div className="md:col-start-2 lg:col-start-auto lg:py-2">
          <Timeline entries={timeline} />
        </div>
      </div>
    </section>
  );
}
