import type { TestimonialsCopy } from "@/types/content";
import { isCloudinaryUrl } from "@/lib/cloudinary/url";
import { SECTION_IDS } from "@/lib/sections";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TestimonialGallery } from "@/components/testimonials/TestimonialGallery";

const HOME_PAGE_SIZE = 8;

/**
 * Homepage testimonials — the uploaded testimonial images (each already contains its text) in the
 * same square grid as /testimonials: 4 columns on desktop, 2 on tablets, 1 on phones. Shows 8,
 * "View more" reveals 8 more in place. Hidden until at least one image is published.
 */
export function TestimonialsSection({ copy }: { copy: TestimonialsCopy }) {
  const images = (copy.images ?? []).filter((m) => isCloudinaryUrl(m.url));
  if (images.length === 0) return null;
  return (
    <section id={SECTION_IDS.testimonials} className="pb-section">
      <div className="container-site">
        <div className="section-rule">
          <Reveal>
            <SectionHeading label={copy.label} title={copy.heading} intro={copy.intro} />
          </Reveal>
          <TestimonialGallery
            images={images}
            pageSize={HOME_PAGE_SIZE}
            moreLabel="View more"
            showCount={false}
            emptyText={null}
            footer={
              copy.cta && (
                <Button href={copy.cta.href} variant="text">
                  {copy.cta.label}
                </Button>
              )
            }
          />
        </div>
      </div>
    </section>
  );
}
