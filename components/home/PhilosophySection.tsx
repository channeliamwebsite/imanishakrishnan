import type { PhilosophyContent } from "@/types/content";
import { MediaImage } from "@/components/ui/Image";
import { Reveal } from "@/components/ui/Reveal";

/** Full-bleed split (1440px reference): portrait ~36%, blue-grey quote panel ~64%. */
export function PhilosophySection({ content }: { content: PhilosophyContent }) {
  return (
    <section aria-label="Philosophy" className="grid lg:min-h-[30rem] lg:grid-cols-[36%_64%]">
      <MediaImage
        media={content.image}
        ratio={null}
        sizes="(min-width: 1024px) 36vw, 100vw"
        className="aspect-[4/3] sm:aspect-[16/9] lg:aspect-auto"
        imageClassName="object-[30%_center]"
        tone="dark"
      />

      <div className="flex items-center bg-[linear-gradient(170deg,var(--dark-section)_0%,var(--dark-section-deep)_100%)] text-white">
        {/* Calm entrance: quote mark fades, then quote, supporting line and attribution rise in turn. */}
        <div className="w-full px-gutter py-[clamp(3.5rem,6vw,4.5rem)] lg:pl-[36%] lg:pr-[clamp(2.5rem,6vw,5rem)]">
          <blockquote className="relative">
            <Reveal y={0} duration={0.6} className="lg:absolute lg:-left-[4.25rem] lg:-top-1">
              <span aria-hidden className="block h-10 font-serif text-[6rem] font-semibold leading-[0.85] text-white/95">
                &ldquo;
              </span>
            </Reveal>
            <Reveal delay={0.1} duration={0.75}>
              <p className="type-quote mt-2 max-w-[27rem] lg:mt-0">{content.quote}</p>
            </Reveal>
            <Reveal delay={0.25} duration={0.75}>
              <span aria-hidden className="mt-8 block h-0.5 w-14 bg-white/80" />
              <p className="type-body-sans mt-8 max-w-[34rem] text-white/85">{content.supportingText}</p>
            </Reveal>
            {content.author && (
              <Reveal delay={0.35} duration={0.75}>
                <footer className="mt-6">
                  <cite className="type-label not-italic tracking-[0.18em] text-white/85">{content.author}</cite>
                </footer>
              </Reveal>
            )}
          </blockquote>
        </div>
      </div>
    </section>
  );
}
