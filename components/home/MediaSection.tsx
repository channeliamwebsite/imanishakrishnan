import NextImage from "next/image";
import type { Achievement, MediaAsset, MediaFeature, SectionCopy } from "@/types/content";
import { isCloudinaryUrl } from "@/lib/cloudinary/url";
import { SECTION_IDS } from "@/lib/sections";
import { CarouselNav } from "@/components/ui/CarouselNav";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ViewAllArrow } from "@/components/ui/ViewAllArrow";

type StripItem = { id: string; name: string; logo?: MediaAsset; url?: string };
type StripCopy = { label?: string; heading: string; tagline?: string };

/**
 * Horizontal name/logo strip with a section heading — shared by "In the Media" (publications)
 * and "Awards & Honours" (achievements). Each section gets its own data source and id.
 */
function NameStrip({
  id,
  items,
  copy,
  viewAll,
}: {
  id: string;
  items: StripItem[];
  copy: StripCopy;
  /** Arrow-only "view all" link in the header. */
  viewAll?: { href: string; label: string };
}) {
  if (items.length === 0) return null;
  const trackId = `${id}-track`;
  return (
    <section id={id} className="pb-section">
      <div className="container-site">
        <div className="section-rule relative">
          <SectionHeading
            className={viewAll && "pr-14 md:pr-0"}
            label={copy.label}
            title={copy.heading}
            rule="after"
            aside={
              <>
                {copy.tagline && <p className="type-small hidden text-muted xl:block">{copy.tagline}</p>}
                <CarouselNav targetId={trackId} className="hidden md:flex" />
                {viewAll && <ViewAllArrow {...viewAll} className="hidden md:grid" />}
              </>
            }
          />
          {/* Phones: the arrow sits at the top right of the heading — no extra row. */}
          {viewAll && <ViewAllArrow {...viewAll} className="absolute right-0 top-[var(--section-y)] md:hidden" />}
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
      viewAll={{ href: "/media", label: "View all press coverage" }}
    />
  );
}

/** Awards & Honours — awards only (achievements collection). */
export function AwardsSection({ items, copy }: { items: Achievement[]; copy: StripCopy }) {
  return (
    <NameStrip id={SECTION_IDS.awards} copy={copy} items={items.map((a) => ({ id: a.id, name: a.title, logo: a.image }))} />
  );
}
