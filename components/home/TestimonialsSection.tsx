import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { TestimonialsCopy } from "@/types/content";
import { isCloudinaryUrl } from "@/lib/cloudinary/url";
import { SECTION_IDS } from "@/lib/sections";
import { Reveal } from "@/components/ui/Reveal";
import { TestimonialCarousel } from "@/components/testimonials/TestimonialCarousel";

/**
 * Homepage testimonials — the uploaded testimonial images (each already contains its text) in a
 * horizontal carousel: two per view from tablet up, one on phones. Centred editorial heading with
 * thin rules; the full collection is at /testimonials. Hidden until at least one image is published.
 */
export function TestimonialsSection({ copy }: { copy: TestimonialsCopy }) {
  const images = (copy.images ?? []).filter((m) => isCloudinaryUrl(m.url));
  if (images.length === 0) return null;
  return (
    <section id={SECTION_IDS.testimonials} className="pb-section">
      <div className="container-site">
        <div className="section-rule">
          <Reveal className="mx-auto mb-10 flex max-w-[40rem] flex-col items-center text-center md:mb-12">
            {copy.label && (
              <p className="type-label flex items-center gap-4 text-rose">
                <span aria-hidden className="block h-px w-8 bg-rose/50 md:w-12" />
                {copy.label}
                <span aria-hidden className="block h-px w-8 bg-rose/50 md:w-12" />
              </p>
            )}
            <h2 className="type-h2 mt-4 text-foreground">{copy.heading}</h2>
            <span aria-hidden className="mt-5 block h-0.5 w-12 bg-burgundy" />
            {copy.intro && <p className="type-small mt-5 text-muted">{copy.intro}</p>}
          </Reveal>

          <Reveal>
            <TestimonialCarousel images={images} label={copy.heading} />
          </Reveal>

          {copy.cta && (
            <div className="mt-10 flex justify-center">
              <Link
                href={copy.cta.href}
                className="type-button group inline-flex h-12 items-center gap-3 border border-burgundy bg-background px-7 text-burgundy transition-colors duration-300 hover:bg-burgundy hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
              >
                {copy.cta.label}
                <ArrowRight
                  className="size-3.5 transition-transform duration-300 ease-editorial motion-safe:group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
