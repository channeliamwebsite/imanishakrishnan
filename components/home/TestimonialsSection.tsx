import NextImage from "next/image";
import { Quote } from "lucide-react";
import type { SectionCopy, Testimonial } from "@/types/content";
import { isCloudinaryUrl } from "@/lib/cloudinary/url";
import { SECTION_IDS } from "@/lib/sections";
import { Card } from "@/components/ui/Card";
import { CarouselNav } from "@/components/ui/CarouselNav";
import { MediaImage } from "@/components/ui/Image";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

const TRACK_ID = "testimonials-track";

/**
 * Testimonials (testimonials collection, published items in `order`). Renders nothing until at
 * least one testimonial is published — no placeholder quotes, names or photos.
 * Mobile: one card per view. Tablet: two. Desktop: three; arrows scroll when there are more.
 */
export function TestimonialsSection({
  items,
  copy,
}: {
  items: Testimonial[];
  copy: NonNullable<SectionCopy["testimonials"]>;
}) {
  if (items.length === 0) return null;
  return (
    <section id={SECTION_IDS.testimonials} className="pb-section">
      <div className="container-site">
        <div className="section-rule">
          <SectionHeading
            label={copy.label}
            title={copy.heading}
            intro={copy.intro}
            aside={<CarouselNav targetId={TRACK_ID} />}
          />

          <ul id={TRACK_ID} className="scroll-track flex gap-card">
            {items.map((t, i) => (
              <li
                key={t.id}
                className="w-full shrink-0 md:w-[calc((100%-var(--card-gap))/2)] xl:w-[calc((100%-2*var(--card-gap))/3)]"
              >
                <Reveal delay={Math.min(i, 2) * 0.08} className="h-full">
                  <Card>
                    <figure className="flex h-full flex-col p-card-pad">
                      <Quote className="size-6 text-rose" aria-hidden />
                      <blockquote className="type-quote mt-4 flex-1 text-[clamp(1.25rem,1.5vw,1.5rem)] text-foreground">
                        <p>{t.quote}</p>
                      </blockquote>

                      <figcaption className="mt-8 flex items-center gap-4 border-t hairline pt-6">
                        {t.avatar?.url && (
                          <MediaImage
                            media={{ ...t.avatar, alt: t.avatar.alt ?? t.name }}
                            ratio="1/1"
                            sizes="56px"
                            className="size-14 shrink-0 rounded-full"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="type-h4 text-foreground">{t.name}</p>
                          {(t.role || t.organisation) && (
                            <p className="type-small mt-0.5 text-muted">
                              {[t.role, t.organisation].filter(Boolean).join(", ")}
                            </p>
                          )}
                        </div>
                        {t.logo && isCloudinaryUrl(t.logo.url) && (
                          <NextImage
                            src={t.logo.url}
                            alt={t.logo.alt ?? t.organisation ?? ""}
                            width={t.logo.width ?? 160}
                            height={t.logo.height ?? 64}
                            className="h-8 w-auto max-w-[6rem] shrink-0 object-contain opacity-70"
                          />
                        )}
                      </figcaption>
                    </figure>
                  </Card>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
