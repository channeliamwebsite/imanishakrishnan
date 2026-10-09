import type { AboutContent, TimelineEntry } from "@/types/content";
import { SECTION_IDS } from "@/lib/sections";
import { Button } from "@/components/ui/Button";
import { MediaImage } from "@/components/ui/Image";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Timeline } from "./Timeline";

/**
 * Reference composition (1440px): collage bleeds off the left edge (~33% of the viewport),
 * story column ~48% of the container, timeline ~14% with a full-height rule.
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
              sizes="(min-width: 1024px) 34vw, 100vw"
              className="col-span-2"
              imageClassName="grayscale"
            />
            {content.keywords && (
              <ul className="type-meta flex flex-col justify-end gap-2 pb-2 text-[0.625rem] tracking-[0.14em] whitespace-nowrap text-muted lg:pl-[var(--bleed)]">
                {content.keywords.map((word) => (
                  <li key={word}>{word}</li>
                ))}
              </ul>
            )}
            {secondary && (
              <MediaImage
                media={secondary}
                ratio="14/15"
                sizes="(min-width: 1024px) 18vw, 52vw"
                className={content.keywords ? undefined : "col-start-2"}
                imageClassName="grayscale"
              />
            )}
          </div>
        </Reveal>

        {/* Story — heading, paragraphs and link reveal in a short sequence */}
        <div className="flex flex-col justify-center">
          <Reveal delay={0.05}>
            <SectionHeading label={content.label} title={content.heading} rule="below" className="max-w-[28rem]" />
          </Reveal>
          <div className="prose-editorial type-body max-w-[38rem] text-foreground/80">
            {content.paragraphs.map((p, i) => (
              <Reveal key={i} delay={0.12 + i * 0.08}>
                <p>{p}</p>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.12 + content.paragraphs.length * 0.08} className="mt-7 self-start">
            <Button href={content.cta.href} variant="text">
              {content.cta.label}
            </Button>
          </Reveal>
        </div>

        {/* Career timeline — milestones reveal individually as they enter the viewport */}
        <div className="md:col-start-2 lg:col-start-auto lg:py-2">
          <Timeline entries={timeline} />
        </div>
      </div>
    </section>
  );
}
