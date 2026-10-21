import Link from "next/link";
import NextImage from "next/image";
import { ArrowRight } from "lucide-react";
import type { EcosystemAbout, EcosystemEvent, MediaAsset, ProfileContent, ProfilePageCopy, TimelineEntry } from "@/types/content";
import { isCloudinaryUrl } from "@/lib/cloudinary/url";
import { cn } from "@/lib/cn";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AwardsGallery } from "@/components/awards/AwardsGallery";
import { ViewAllArrow } from "@/components/ui/ViewAllArrow";
import { NewsGallery } from "./NewsGallery";
import { EcosystemHighlights, type Highlight } from "./EcosystemHighlights";
import { formatDate } from "@/lib/format-date";

const ECOSYSTEM_BUILDER_HEADING = "Building Ecosystems Through Collaboration";

/** Small numbered marker used for achievements. */
const num = (n: number) => String(n).padStart(2, "0");

/**
 * Soft fade of the /about portrait into the background: an opaque centre, a longer fade over the
 * last ~22% at the bottom and a short one at the left/right edges (the two masks intersect).
 */
const FADE_MASK = [
  "linear-gradient(to bottom, #000 0%, #000 78%, transparent 100%)",
  "linear-gradient(to right, transparent 0%, #000 9%, #000 91%, transparent 100%)",
].join(", ");
const PORTRAIT_FADE = {
  maskImage: FADE_MASK,
  WebkitMaskImage: FADE_MASK,
  maskComposite: "intersect",
  WebkitMaskComposite: "source-in",
} as const;

/** Biography paragraphs shown before "Read the full story". */
const STORY_VISIBLE = 3;

const uploaded = (m?: MediaAsset): m is MediaAsset => !!m && isCloudinaryUrl(m.url);

/**
 * An image at its own proportions — never cropped or stretched (object-contain). Pass `h-auto w-full`
 * to fill the column, or a fixed height with `w-auto`: the width then follows the image's aspect
 * ratio (from its width/height), so the space is reserved before a lazy image has loaded.
 */
function Photo({
  media,
  alt,
  sizes,
  priority,
  className,
}: {
  media: MediaAsset;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <NextImage
      src={media.url}
      alt={media.alt ?? alt}
      width={media.width ?? 1200}
      height={media.height ?? 1200}
      sizes={sizes}
      preload={priority}
      className={cn("max-w-full object-contain", className)}
    />
  );
}

/** Ecosystem Builder data for /about: ecosystem/main → about, plus events marked as About highlights. */
export type AboutEcosystem = { about?: EcosystemAbout; events: EcosystemEvent[] };

/** Text after the first `visible` paragraphs is folded into a "Read more" disclosure. */
function Paragraphs({ items, visible, className, more = "Read more" }: { items: string[]; visible: number; className?: string; more?: string }) {
  if (items.length === 0) return null;
  return (
    <div className={cn("prose-editorial type-body text-foreground/80", className)}>
      {items.slice(0, visible).map((p, i) => (
        <p key={i}>{p}</p>
      ))}
      {items.length > visible && (
        <details className="group">
          <summary className="type-button inline-flex cursor-pointer list-none items-center gap-3 text-burgundy transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">{more}</span>
            <span className="hidden group-open:inline">Show less</span>
            <span aria-hidden className="block h-px w-8 bg-current" />
          </summary>
          {items.slice(visible).map((p, i) => (
            <p key={i} className="mt-5">
              {p}
            </p>
          ))}
        </details>
      )}
    </div>
  );
}

/**
 * The /about page, in six compact sections: 1 About / My Story, 2 Awards & Recognition (gallery,
 * archive and news clippings), 3 Timeline, 4 Ecosystem Builder, 5 Expertise In, 6 My Leadership
 * Philosophy. Everything comes from the CMS (about/main → profile, the timeline collection,
 * ecosystem/main → about and the ecosystem events) or the built-in content; sections and fields
 * without content are omitted. Rendered by app/(site)/about/page.tsx and by the admin preview.
 */
export function ProfileView({
  profile,
  page,
  timeline,
  ecosystem,
}: {
  profile: ProfileContent;
  page: ProfilePageCopy;
  timeline: TimelineEntry[];
  ecosystem?: AboutEcosystem;
}) {
  const [opening, ...story] = profile.detailedBio;
  const portrait = uploaded(profile.intro?.image) ? profile.intro!.image : uploaded(profile.storyImage) ? profile.storyImage : undefined;
  const philosophyImage = uploaded(profile.philosophy.image) ? profile.philosophy.image : undefined;
  const gallery = (profile.achievements.gallery ?? []).filter((g) => g.published !== false && uploaded(g.image));
  const news = profile.news;
  const clippings = (news?.items ?? []).filter((n) => n.published !== false && uploaded(n.image));
  const expertise = profile.expertise.items.filter((x) => x.published !== false);
  const panelQuote = profile.philosophy.quote;

  // Ecosystem Builder: the published Ecosystem Enabler events marked "Show on the About page" (same
  // records as /ecosystem-enabler, already filtered to published and in display order), then any
  // supporting images. The section is hidden when nothing is selected.
  const eco = ecosystem?.about;
  const ecoFeatured = eco && uploaded(eco.featuredImage) ? eco.featuredImage : undefined;
  const ecoHighlights: Highlight[] = [
    ...(ecosystem?.events ?? [])
      .filter((e) => e.aboutHighlight && e.images.some(uploaded))
      .map((e) => ({
        key: `event-${e.id}`,
        images: e.images.filter(uploaded),
        title: e.name,
        organisation: e.summit,
        date: formatDate(e.date),
        description: e.description,
      })),
    ...(eco?.images ?? []).filter(uploaded).map((m, i) => ({ key: `img-${m.publicId || i}`, images: [m], title: m.caption })),
  ];

  return (
    <>
      {/* ── 1 · About / My Story: introduction and biography beside the portrait ── */}
      <section id="biography" className="section-y">
        <div className="container-site grid items-start gap-10 lg:grid-cols-12 lg:gap-14">
          <Reveal className={cn(portrait ? "lg:col-span-7" : "lg:col-span-10")}>
            <p className="type-label flex items-center gap-4 text-rose">
              {page.eyebrow}
              <span aria-hidden className="block h-px w-12 bg-rose/50" />
            </p>
            <h1 className="type-h1 mt-4 text-foreground">{page.title}</h1>
            <span aria-hidden className="mt-5 block h-0.5 w-16 bg-burgundy" />
            {profile.tagline && <p className="type-lead mt-5 max-w-[42rem] text-foreground/85">{profile.tagline}</p>}
            {page.biographyHeading && <h2 className="type-h3 mt-8 text-foreground">{page.biographyHeading}</h2>}
            <Paragraphs items={[opening, ...story].filter(Boolean)} visible={STORY_VISIBLE} more="Read the full story" className="mt-4 max-w-[42rem]" />
            {profile.intro?.quote && (
              <blockquote className="mt-7 max-w-[34rem] border-l-2 border-burgundy pl-6">
                <p className="type-quote text-[clamp(1.125rem,1.5vw,1.375rem)] text-foreground">{profile.intro.quote}</p>
              </blockquote>
            )}
          </Reveal>
          {portrait && (
            <Reveal delay={0.1} className="lg:sticky lg:top-28 lg:col-span-5">
              {/* No frame: the portrait fades softly into the cream page via a CSS mask. */}
              <figure className="relative mx-auto w-fit lg:mr-0" style={PORTRAIT_FADE}>
                <Photo
                  media={portrait}
                  alt={page.title}
                  priority
                  sizes="(min-width: 1024px) 26rem, 22rem"
                  className="relative h-[26rem] w-auto lg:h-[34rem]"
                />
              </figure>
            </Reveal>
          )}
        </div>
      </section>

      {/* ── 2 · Awards & Recognition: gallery (natural proportions), archive, news clippings ── */}
      <section id="awards" className="pb-section">
        <div className="container-site section-rule">
          <Reveal className="relative">
            <SectionHeading
              className="pr-14"
              label={page.recognitionLabel}
              title={profile.achievements.heading}
              intro={profile.achievements.tagline}
            />
            {/* Arrow-only link to the full gallery, at the top right of the heading on every screen size. */}
            <ViewAllArrow href="/awards" label="View all awards" className="absolute right-0 top-0" />
          </Reveal>
          {gallery.length > 0 && <AwardsGallery items={gallery} compact />}

          {/* Text archive: every achievement, with or without an image. */}
          <div className="mt-6 grid gap-x-grid gap-y-8 md:grid-cols-2">
            {profile.achievements.groups.map((group, g) => {
              const offset = profile.achievements.groups.slice(0, g).reduce((sum, prev) => sum + prev.items.length, 0);
              return (
                <div key={g}>
                  <h3 className="type-caps flex items-center gap-4 text-rose">
                    {group.heading}
                    <span aria-hidden className="block h-px flex-1 bg-rose/25" />
                  </h3>
                  <ul className="mt-4 space-y-4">
                    {group.items.map((a, i) => (
                      <li key={i} className="flex gap-4">
                        <span className="type-figure text-lg leading-snug text-burgundy/70">{num(offset + i + 1)}</span>
                        <div>
                          <h4 className="type-h4 text-foreground">{a.title}</h4>
                          {a.description && <p className="type-small mt-1 line-clamp-2 text-muted">{a.description}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {news && clippings.length > 0 && (
            <div id="news" className="mt-12 border-t hairline pt-8">
              <h3 className="type-h3 text-foreground">{news.heading}</h3>
              {news.intro && <p className="type-small mt-2 max-w-[42rem] text-muted">{news.intro}</p>}
              <div className="mt-6">
                <NewsGallery items={clippings} />
              </div>
            </div>
          )}

        </div>
      </section>

      {/* ── 3 · Timeline: one left-aligned line; images keep their own proportions (never cropped) ── */}
      {timeline.length > 0 && (
        <section id="milestones" className="pb-section">
          <div className="container-site section-rule">
            <Reveal>
              <SectionHeading label={page.milestonesLabel} title={page.milestonesHeading} intro={page.milestonesIntro} />
            </Reveal>
            <ol className="relative ml-[3px] border-l border-burgundy/30">
              {timeline.map((entry) => {
                const vision = entry.kind === "vision";
                const image = uploaded(entry.image) ? entry.image : undefined;
                return (
                  <li key={entry.id} className="relative pb-9 pl-7 last:pb-0 md:pl-10">
                    <span
                      aria-hidden
                      className={cn(
                        "absolute -left-[4px] top-[0.55rem] size-[7px] rounded-full",
                        vision ? "border border-rose bg-background" : "bg-burgundy",
                      )}
                    />
                    <Reveal y={10} className="grid gap-x-8 gap-y-3 md:grid-cols-[6.5rem_minmax(0,1fr)] lg:grid-cols-[7rem_minmax(0,1fr)_20rem]">
                      <div>
                        <p className={cn("type-figure text-[1.375rem] leading-none md:text-[1.625rem]", vision ? "text-rose" : "text-burgundy")}>
                          {entry.year}
                        </p>
                        {vision && <p className="type-label mt-2 text-rose">Vision</p>}
                      </div>
                      <div>
                        <h3 className="type-h4 text-foreground">{entry.title}</h3>
                        {entry.description && <p className="type-small mt-1.5 max-w-[40rem] text-muted">{entry.description}</p>}
                      </div>
                      {image && (
                        <figure className="md:col-start-2 lg:col-start-3 lg:row-start-1">
                          {/* Natural aspect ratio: bounded by width and height, never stretched or cropped;
                              width/height attributes reserve the space before the image loads. */}
                          <Photo
                            media={image}
                            alt={image.alt ?? entry.title}
                            sizes="(min-width: 1024px) 20rem, (min-width: 768px) 24rem, 90vw"
                            className="h-auto max-h-[15rem] w-auto"
                          />
                          {image.caption && <figcaption className="type-meta mt-2 text-muted">{image.caption}</figcaption>}
                        </figure>
                      )}
                    </Reveal>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      )}

      {/* ── 4 · Ecosystem Builder: introduction, then the selected event gallery ── */}
      {ecoHighlights.length > 0 && (
        <section id="ecosystem" className="pb-section">
          <div className="container-site section-rule">
            <div className={cn("grid items-center gap-10", ecoFeatured && "lg:grid-cols-12 lg:gap-14")}>
              <Reveal className={ecoFeatured ? "lg:col-span-6" : undefined}>
                <SectionHeading label="Ecosystem Builder" title={eco?.heading || ECOSYSTEM_BUILDER_HEADING} />
                {eco && <Paragraphs items={eco.intro} visible={2} className="max-w-[40rem]" />}
                <Link
                  href="/ecosystem-enabler"
                  className="type-button group mt-5 inline-flex items-center gap-3 text-burgundy transition-colors hover:text-foreground"
                >
                  Explore More
                  <ArrowRight className="size-3.5 transition-transform duration-300 motion-safe:group-hover:translate-x-1" aria-hidden />
                </Link>
              </Reveal>
              {ecoFeatured && (
                <Reveal delay={0.06} className="lg:col-span-6">
                  <Photo media={ecoFeatured} alt={ecoFeatured.alt ?? (eco?.heading || ECOSYSTEM_BUILDER_HEADING)} sizes="(min-width: 1024px) 46vw, 100vw" className="h-auto max-h-[24rem] w-full" />
                </Reveal>
              )}
            </div>
            <div className="mt-10">
              <EcosystemHighlights items={ecoHighlights} />
            </div>
          </div>
        </section>
      )}

      {/* ── 5 · Expertise In: compact cards ── */}
      {expertise.length > 0 && (
        <section id="expertise" className="pb-section">
          <div className="container-site section-rule">
            <Reveal>
              <SectionHeading label={profile.expertise.subtitle} title={profile.expertise.heading} intro={profile.expertise.intro[0]} />
            </Reveal>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {expertise.map((x, i) => (
                <li key={i} id={x.anchor} className="scroll-mt-28 border hairline bg-white/30 p-5">
                  <h3 className="type-h4 text-foreground">{x.title}</h3>
                  {x.description && <p className="type-small mt-2 text-foreground/75">{x.description}</p>}
                  {(x.details?.length || x.strengths) && (
                    <details className="group mt-2">
                      <summary className="type-meta inline-flex cursor-pointer list-none items-center gap-2 text-burgundy hover:text-foreground [&::-webkit-details-marker]:hidden">
                        <span className="group-open:hidden">More</span>
                        <span className="hidden group-open:inline">Less</span>
                      </summary>
                      {x.details?.map((d, j) => (
                        <p key={j} className="type-small mt-2 text-muted">
                          {d}
                        </p>
                      ))}
                      {x.strengths && (
                        <p className="type-small mt-2 text-muted">
                          <span className="type-label mr-2 text-rose">Core strengths</span>
                          {x.strengths}
                        </p>
                      )}
                    </details>
                  )}
                </li>
              ))}
            </ul>
            {profile.expertise.distinctiveStrength.heading && (
              <details className="group mt-6 border-l-2 border-burgundy pl-6">
                <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <span className="type-h4 text-foreground">{profile.expertise.distinctiveStrength.heading}</span>
                  <span className="type-meta ml-3 text-burgundy group-open:hidden">Read more</span>
                </summary>
                <div className="prose-editorial type-body mt-3 max-w-[46rem] text-foreground/80">
                  {[...profile.expertise.intro.slice(1), ...profile.expertise.distinctiveStrength.paragraphs].map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </details>
            )}
          </div>
        </section>
      )}

      {/* ── 6 · My Leadership Philosophy: image beside a short statement and the text ── */}
      <section id="philosophy" className="pb-section">
        <div className="container-site section-rule grid items-start gap-10 lg:grid-cols-12 lg:gap-14">
          {philosophyImage && (
            <Reveal className="lg:col-span-5">
              <Photo media={philosophyImage} alt={page.title} sizes="(min-width: 1024px) 38vw, 100vw" className="h-auto max-h-[32rem] w-full" />
            </Reveal>
          )}
          <Reveal className={philosophyImage ? "lg:col-span-7" : "lg:col-span-10"}>
            <SectionHeading label={page.leadershipLabel} title={profile.philosophy.heading} />
            {profile.philosophy.subtitle && <p className="type-lead -mt-2 mb-6 max-w-[40rem] text-burgundy">{profile.philosophy.subtitle}</p>}
            <Paragraphs items={profile.philosophy.paragraphs} visible={2} className="max-w-[40rem]" />
            {panelQuote && (
              <blockquote className="mt-7 max-w-[36rem] border-l-2 border-burgundy pl-6">
                <p className="type-quote text-[clamp(1.125rem,1.5vw,1.375rem)] text-foreground">{panelQuote}</p>
                <p className="type-label mt-3 text-rose">— {page.title}</p>
              </blockquote>
            )}
          </Reveal>
        </div>
      </section>
    </>
  );
}
