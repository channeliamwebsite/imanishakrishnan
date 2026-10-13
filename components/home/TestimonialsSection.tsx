import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { TestimonialsCopy } from "@/types/content";
import { isCloudinaryUrl } from "@/lib/cloudinary/url";
import { SECTION_IDS } from "@/lib/sections";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TestimonialCarousel } from "@/components/testimonials/TestimonialCarousel";

/**
 * Homepage testimonials — the uploaded testimonial images (each already contains its text) in a
 * horizontal carousel: two per view from tablet up, one on phones. Left-aligned section heading like
 * the other homepage sections; the full collection is at /testimonials. Hidden until at least one
 * image is published.
 */
export function TestimonialsSection({ copy }: { copy: TestimonialsCopy }) {
  const images = (copy.images ?? []).filter((m) => isCloudinaryUrl(m.url));
  if (images.length === 0) return null;
  return (
    <section id={SECTION_IDS.testimonials} className="pb-section">
      <div className="container-site">
        <div className="section-rule">
          <Reveal>
            <SectionHeading label={copy.label} title={copy.heading} intro={copy.intro} rule="below" />
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
