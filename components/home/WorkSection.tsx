import Link from "next/link";
import NextImage from "next/image";
import { ArrowRight } from "lucide-react";
import type { SectionCopy, WorkItem } from "@/types/content";
import { isCloudinaryUrl } from "@/lib/cloudinary/url";
import { SECTION_IDS } from "@/lib/sections";
import { Card, CardBody } from "@/components/ui/Card";
import { CarouselNav } from "@/components/ui/CarouselNav";
import { Icon } from "@/components/ui/Icon";
import { MediaImage } from "@/components/ui/Image";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

const TRACK_ID = "work-track";

/** Detail pages (/work/{slug}) open in place; external sites in a new tab, safely. */
const linkProps = (href: string) =>
  /^https?:\/\//i.test(href) ? { target: "_blank", rel: "noopener noreferrer" } : {};

/** Logo area: the brand logo when uploaded, otherwise icon + category + tagline. */
function WorkLogo({ item }: { item: WorkItem }) {
  if (item.logo && isCloudinaryUrl(item.logo.url)) {
    return (
      <NextImage
        src={item.logo.url}
        alt={item.logo.alt ?? item.category}
        width={item.logo.width ?? 240}
        height={item.logo.height ?? 80}
        className="max-h-16 w-auto object-contain"
      />
    );
  }
  return (
    <div className="flex flex-col items-center gap-2.5 text-center">
      {item.icon && <Icon name={item.icon} className="size-7 text-burgundy" />}
      <p className="type-caps text-[0.8125rem] text-foreground">{item.category}</p>
      {item.tagline && <p className="type-meta text-[0.625rem] text-subtle">{item.tagline}</p>}
    </div>
  );
}

export function WorkSection({ items, copy }: { items: WorkItem[]; copy: SectionCopy["work"] }) {
  return (
    <section id={SECTION_IDS.impact} className="pb-section">
      <div className="container-site">
        <div className="section-rule">
          <SectionHeading
            label={copy.label}
            title={copy.heading}
            aside={<CarouselNav targetId={TRACK_ID} className="hidden md:flex" />}
          />

          {/* Mobile: stacked. Tablet: 2 visible, scrollable. Desktop: all 4. */}
          <ul
            id={TRACK_ID}
            className="grid gap-card md:scroll-track md:flex"
          >
            {items.map((item, i) => (
              <li
                key={item.id}
                className="md:w-[calc((100%-var(--card-gap))/2)] md:shrink-0 xl:w-[calc((100%-3*var(--card-gap))/4)]"
              >
                <Reveal delay={i * 0.08} className="h-full">
                  <Card>
                    <div className="flex h-32 items-center justify-center px-card-pad">
                      <WorkLogo item={item} />
                    </div>
                    {/* Hover (pointer devices only): image eases to 1.02 inside its clipping frame. */}
                    <MediaImage
                      media={item.coverImage}
                      ratio="7/3"
                      sizes="(min-width: 1280px) 22vw, (min-width: 768px) 45vw, 100vw"
                      imageClassName="transition-transform duration-[400ms] ease-editorial group-hover:scale-[1.02]"
                    />
                    <CardBody>
                      <h3 className="type-h4 text-foreground transition-colors duration-300 group-hover:text-burgundy">
                        {item.title}
                      </h3>
                      <p className="type-small text-muted">{item.description}</p>
                      <Link
                        href={item.cta.href}
                        {...linkProps(item.cta.href)}
                        className="type-button inline-flex items-center gap-3 self-start pt-4 text-burgundy transition-colors hover:text-foreground"
                      >
                        {item.cta.label}
                        <ArrowRight
                          className="size-3.5 transition-transform duration-300 ease-editorial group-hover:translate-x-1"
                          aria-hidden
                        />
                      </Link>
                    </CardBody>
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
