import NextImage from "next/image";
import type { TestimonialsCopy } from "@/types/content";
import { isCloudinaryUrl } from "@/lib/cloudinary/url";
import { SECTION_IDS } from "@/lib/sections";
import { Button } from "@/components/ui/Button";
import { CarouselNav } from "@/components/ui/CarouselNav";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

const TRACK_ID = "testimonials-track";

/** Meaningful alt text: the editor's, otherwise the position. */
export const testimonialAlt = (alt: string | undefined, index: number) => alt?.trim() || `Testimonial ${index + 1}`;

/**
 * Homepage testimonials — the uploaded testimonial images, which already contain their text.
 * Each sits whole in a 4:5 frame (object-contain: nothing is cropped). Swipe on touch screens,
 * arrows from tablet up. Hidden until at least one image is uploaded and published.
 * Visible at once: ~1.5 on phones, 3 on tablets, 4 on laptops, 5 on wide desktops.
 */
export function TestimonialsSection({ copy }: { copy: TestimonialsCopy }) {
  const images = (copy.images ?? []).filter((m) => isCloudinaryUrl(m.url));
  if (images.length === 0) return null;
  return (
    <section id={SECTION_IDS.testimonials} className="pb-section">
      <div className="container-site">
        <div className="section-rule">
          <SectionHeading
            label={copy.label}
            title={copy.heading}
            intro={copy.intro}
            aside={<CarouselNav targetId={TRACK_ID} className="hidden md:flex" />}
          />

          <ul
            id={TRACK_ID}
            aria-label={copy.heading}
            className="scroll-track -mx-gutter flex scroll-px-gutter gap-4 px-gutter md:mx-0 md:scroll-px-0 md:px-0 lg:gap-5"
          >
            {images.map((image, i) => (
              <li
                key={image.publicId || i}
                className="w-[64%] shrink-0 xs:w-[44%] md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-3*1.25rem)/4)] xl:w-[calc((100%-4*1.25rem)/5)]"
              >
                <Reveal delay={Math.min(i, 4) * 0.06}>
                  <figure className="group relative aspect-[4/5] overflow-hidden border hairline bg-surface">
                    <NextImage
                      src={image.url}
                      alt={testimonialAlt(image.alt, i)}
                      fill
                      sizes="(min-width: 1280px) 19vw, (min-width: 1024px) 23vw, (min-width: 768px) 31vw, (min-width: 480px) 44vw, 64vw"
                      className="object-contain transition-transform duration-500 ease-editorial motion-safe:group-hover:scale-[1.02]"
                    />
                  </figure>
                </Reveal>
              </li>
            ))}
          </ul>

          {copy.cta && (
            <Reveal className="mt-8 flex justify-center md:justify-start">
              <Button href={copy.cta.href} variant="outline" size="sm">
                {copy.cta.label}
              </Button>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
