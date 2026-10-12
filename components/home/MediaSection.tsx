import NextImage from "next/image";
import type { MediaFeature, SectionCopy } from "@/types/content";
import { isCloudinaryUrl } from "@/lib/cloudinary/url";
import { SECTION_IDS } from "@/lib/sections";
import { CarouselNav } from "@/components/ui/CarouselNav";
import { SectionHeading } from "@/components/ui/SectionHeading";

const TRACK_ID = "media-track";

export function MediaSection({ items, copy }: { items: MediaFeature[]; copy: SectionCopy["media"] }) {
  return (
    <section id={SECTION_IDS.media} className="pb-section">
      <div className="container-site">
        <div className="section-rule">
          <SectionHeading
            label={copy.label}
            title={copy.heading}
            rule="after"
            aside={
              <>
                {copy.tagline && <p className="type-small hidden text-muted xl:block">{copy.tagline}</p>}
                <CarouselNav targetId={TRACK_ID} className="hidden md:flex" />
              </>
            }
          />

          {/* Scrolls horizontally when logos don't fit; evenly spread when they do. */}
          <ul
            id={TRACK_ID}
            className="scroll-track -mx-gutter flex scroll-px-gutter items-center gap-x-12 px-gutter lg:mx-0 lg:scroll-px-0 lg:justify-between lg:gap-x-8 lg:px-0"
          >
            {items.map((item) => {
              const content = item.logo && isCloudinaryUrl(item.logo.url) ? (
                <NextImage
                  src={item.logo.url}
                  alt={item.logo.alt ?? item.publication}
                  width={item.logo.width ?? 200}
                  height={item.logo.height ?? 80}
                  className="h-[clamp(2.25rem,3.6vw,3.25rem)] w-auto object-contain opacity-60 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
                />
              ) : (
                // Wordmark fallback until logos are uploaded to Cloudinary.
                <span className="block whitespace-nowrap font-display text-[clamp(1.25rem,1.6vw,1.5rem)] font-semibold leading-none text-foreground/50 transition-colors duration-300 hover:text-foreground/80">
                  {item.publication}
                </span>
              );
              return (
                <li key={item.id} className="shrink-0 py-2">
                  {item.articleUrl ? (
                    <a href={item.articleUrl} target="_blank" rel="noopener noreferrer">
                      {content}
                    </a>
                  ) : (
                    content
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
