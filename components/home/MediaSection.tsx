import Link from "next/link";
import NextImage from "next/image";
import { ArrowRight } from "lucide-react";
import type { Achievement, MediaAsset, MediaFeature, SectionCopy } from "@/types/content";
import { isCloudinaryUrl } from "@/lib/cloudinary/url";
import { SECTION_IDS } from "@/lib/sections";
import { CarouselNav } from "@/components/ui/CarouselNav";
import { SectionHeading } from "@/components/ui/SectionHeading";

type StripItem = { id: string; name: string; logo?: MediaAsset; url?: string };
type StripCopy = { label?: string; heading: string; tagline?: string };

/**
 * Horizontal name/logo strip with a section heading — shared by "In the Media" (publications)
 * and "Awards & Honours" (achievements). Each section gets its own data source and id.
 */
function NameStrip({ id, items, copy, cta }: { id: string; items: StripItem[]; copy: StripCopy; cta?: { label: string; href: string } }) {
  if (items.length === 0) return null;
  const trackId = `${id}-track`;
  return (
    <section id={id} className="pb-section">
      <div className="container-site">
        <div className="section-rule">
          <SectionHeading
            label={copy.label}
            title={copy.heading}
            rule="after"
            aside={
              <>
                {copy.tagline && <p className="type-small hidden text-muted xl:block">{copy.tagline}</p>}
                <CarouselNav targetId={trackId} className="hidden md:flex" />
              </>
            }
          />
          {copy.tagline && <p className="type-small -mt-4 mb-6 text-muted xl:hidden">{copy.tagline}</p>}

          {/* Scrolls horizontally when names don't fit; evenly spread when they do. */}
          <ul
            id={trackId}
            className="scroll-track -mx-gutter flex scroll-px-gutter items-center gap-x-10 px-gutter lg:mx-0 lg:scroll-px-0 lg:justify-between lg:gap-x-8 lg:px-0"
          >
            {items.map((item) => {
              const content =
                item.logo && isCloudinaryUrl(item.logo.url) ? (
                  <NextImage
                    src={item.logo.url}
                    alt={item.logo.alt ?? item.name}
                    width={item.logo.width ?? 200}
                    height={item.logo.height ?? 80}
                    className="h-[clamp(2.25rem,3.6vw,3.25rem)] w-auto object-contain opacity-60 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
                  />
                ) : (
                  // Text name until verified logos are uploaded to Cloudinary.
                  <span className="block whitespace-nowrap font-sans text-[clamp(1.125rem,1.4vw,1.375rem)] font-semibold leading-none text-foreground/55 transition-colors duration-300 hover:text-foreground/85">
                    {item.name}
                  </span>
                );
              return (
                <li key={item.id} className="shrink-0 py-2">
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      {content}
                    </a>
                  ) : (
                    content
                  )}
                </li>
              );
            })}
          </ul>
          {cta && (
            <div className="mt-10 flex">
              <Link
                href={cta.href}
                className="type-button group inline-flex h-12 items-center gap-3 border border-burgundy bg-background px-7 text-burgundy transition-colors duration-300 hover:bg-burgundy hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
              >
                {cta.label}
                <ArrowRight className="size-3.5 transition-transform duration-300 ease-editorial motion-safe:group-hover:translate-x-1" aria-hidden />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/** In the Media — publications only (mediaFeatures collection). */
export function MediaSection({ items, copy }: { items: MediaFeature[]; copy: SectionCopy["media"] }) {
  return (
    <NameStrip
      id={SECTION_IDS.media}
      copy={copy}
      items={items.map((m) => ({ id: m.id, name: m.publication, logo: m.logo, url: m.articleUrl }))}
      cta={{ label: "Explore All Press Coverage", href: "/media" }}
    />
  );
}

/** Awards & Honours — awards only (achievements collection). */
export function AwardsSection({ items, copy }: { items: Achievement[]; copy: StripCopy }) {
  return (
    <NameStrip id={SECTION_IDS.awards} copy={copy} items={items.map((a) => ({ id: a.id, name: a.title, logo: a.image }))} />
  );
}
