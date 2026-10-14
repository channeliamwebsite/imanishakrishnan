import NextImage from "next/image";
import type { MediaAsset, ProfileContent, ProfilePageCopy, RecognitionItem, TimelineEntry } from "@/types/content";
import { isCloudinaryUrl } from "@/lib/cloudinary/url";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { NewsGallery } from "./NewsGallery";

/** Small numbered marker used for achievements. */
const num = (n: number) => String(n).padStart(2, "0");

/** Biography paragraphs shown before "Read the full story". */
const STORY_VISIBLE = 4;

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

/** Caption under a recognition image — only the fields the editor filled in. */
function RecognitionCaption({ item, large }: { item: RecognitionItem; large?: boolean }) {
  const meta = [item.organisation, item.year].filter(Boolean).join(" · ");
  if (!item.title && !meta) return null;
  return (
    <figcaption className="mt-4 border-t hairline pt-3">
      {item.title && <p className={cn("text-foreground", large ? "type-h3" : "type-h4")}>{item.title}</p>}
      {meta && <p className="type-meta mt-1 text-muted">{meta}</p>}
    </figcaption>
  );
}

/**
 * The /about page: editorial introduction, My Story, Recognition (cuttings & awards gallery plus the
 * text archive), Growth Through Time (image-led timeline), Areas of Expertise and the Leadership
 * Philosophy. Everything comes from about/main → profile and the timeline collection (or the
 * built-in content); sections without content are omitted. Rendered by app/(site)/about/page.tsx
 * and by the admin preview, from the same props.
 */
export function ProfileView({
  profile,
  page,
  timeline,
}: {
  profile: ProfileContent;
  page: ProfilePageCopy;
  timeline: TimelineEntry[];
}) {
  const [opening, ...story] = profile.detailedBio;
  const highlights = profile.tagline
    .split(/[·|]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const portrait = uploaded(profile.intro?.image) ? profile.intro!.image : undefined;
  const storyImage = uploaded(profile.storyImage) ? profile.storyImage : undefined;
  const philosophyImage = uploaded(profile.philosophy.image) ? profile.philosophy.image : undefined;
  const gallery = (profile.achievements.gallery ?? []).filter((g) => g.published !== false && uploaded(g.image));
  const [featured, ...restGallery] = gallery;
  const besideFeatured = restGallery.slice(0, 2);
  const moreGallery = restGallery.slice(2);
  const panelQuote = profile.philosophy.quote || profile.philosophy.subtitle;
  const news = profile.news;
  const clippings = (news?.items ?? []).filter((n) => n.published !== false && uploaded(n.image));

  return (
    <>
      {/* ── Introduction: name and opening biography beside the portrait ── */}
      <section className="section-y">
        <div className="container-site grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className={cn(portrait ? "lg:col-span-7" : "lg:col-span-10")}>
            <p className="type-label flex items-center gap-4 text-rose">
              {page.eyebrow}
              <span aria-hidden className="block h-px w-12 bg-rose/50" />
            </p>
            <h1 className="type-h1 mt-5 text-foreground">{page.title}</h1>
            <span aria-hidden className="mt-6 block h-0.5 w-16 bg-burgundy" />
            {profile.tagline && <p className="type-lead mt-6 max-w-[40rem] text-foreground/85">{profile.tagline}</p>}
            {opening && <p className="type-body mt-6 max-w-[40rem] text-foreground/75">{opening}</p>}
            {profile.intro?.quote && (
              <blockquote className="mt-8 max-w-[34rem] border-l-2 border-burgundy pl-6">
                <p className="type-quote text-[clamp(1.25rem,1.6vw,1.5rem)] text-foreground">{profile.intro.quote}</p>
              </blockquote>
            )}
          </Reveal>
          {portrait && (
            <Reveal delay={0.1} className="lg:col-span-5">
              <figure className="relative mx-auto w-fit lg:mr-0">
                {/* Thin offset rule — an editorial detail, not a frame around the photo. */}
                <span aria-hidden className="absolute -bottom-4 -right-4 left-4 top-4 border border-burgundy/30" />
                <Photo
                  media={portrait}
                  alt={page.title}
                  priority
                  sizes="(min-width: 1024px) 26rem, 22rem"
                  className="relative h-[30rem] w-auto lg:h-[36rem]"
                />
              </figure>
            </Reveal>
          )}
        </div>
      </section>

      {/* ── My Story ── */}
      {story.length > 0 && (
        <section id="biography" className="pb-section">
          <div className="container-site">
            <div className="section-rule">
              <Reveal>
                <SectionHeading label={page.biographyLabel} title={page.biographyHeading} />
              </Reveal>
              <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
                {(storyImage || highlights.length > 0) && (
                  <aside className="lg:col-span-5">
                    {storyImage && (
                      <Reveal>
                        <Photo media={storyImage} alt={page.title} sizes="(min-width: 1024px) 34vw, 100vw" className="h-auto w-full" />
                      </Reveal>
                    )}
                    {highlights.length > 0 && (
                      <Reveal delay={0.05}>
                        <ul className={cn("border-l-2 border-burgundy pl-6", storyImage && "mt-8")}>
                          {highlights.map((h) => (
                            <li key={h} className="type-caps py-1.5 text-foreground/80">
                              {h}
                            </li>
                          ))}
                        </ul>
                      </Reveal>
                    )}
                  </aside>
                )}
                <div className="prose-editorial type-body max-w-[42rem] text-foreground/80 lg:col-span-7">
                  {story.slice(0, STORY_VISIBLE).map((p, i) => (
                    <Reveal key={i} delay={Math.min(i, 3) * 0.05}>
                      <p>{p}</p>
                    </Reveal>
                  ))}
                  {story.length > STORY_VISIBLE && (
                    <details className="group">
                      <summary className="type-button inline-flex cursor-pointer list-none items-center gap-3 text-burgundy transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
                        <span className="group-open:hidden">Read the full story</span>
                        <span className="hidden group-open:inline">Show less</span>
                        <span aria-hidden className="block h-px w-8 bg-current" />
                      </summary>
                      <div className="mt-6 space-y-[inherit]">
                        {story.slice(STORY_VISIBLE).map((p, i) => (
                          <p key={i} className="mt-5 first:mt-0">
                            {p}
                          </p>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── News & Media Recognition: newspaper clippings and press coverage uploaded in the CMS ── */}
      {news && clippings.length > 0 && (
        <section id="news" className="pb-section">
          <div className="container-site">
            <div className="section-rule">
              <Reveal>
                <SectionHeading label={news.label} title={news.heading} intro={news.intro} />
              </Reveal>
              <NewsGallery items={clippings} />
            </div>
          </div>
        </section>
      )}

      {/* ── Recognition: cuttings & awards gallery, then the full archive ── */}
      <section id="awards" className="pb-section">
        <div className="container-site">
          <div className="section-rule">
            <Reveal>
              <SectionHeading label={page.recognitionLabel} title={profile.achievements.heading} intro={profile.achievements.tagline} />
            </Reveal>

            {featured && (
              <div className="mb-14 grid gap-10 lg:grid-cols-12 lg:gap-12">
                <Reveal className={besideFeatured.length ? "lg:col-span-7" : "lg:col-span-8"}>
                  <figure>
                    <Photo media={featured.image} alt={featured.title ?? "Recognition"} sizes="(min-width: 1024px) 56vw, 100vw" className="h-auto w-full" />
                    <RecognitionCaption item={featured} large />
                  </figure>
                </Reveal>
                {besideFeatured.length > 0 && (
                  <div className="grid content-start gap-10 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
                    {besideFeatured.map((item, i) => (
                      <Reveal key={item.image.publicId || i} delay={(i + 1) * 0.06}>
                        <figure>
                          <Photo media={item.image} alt={item.title ?? "Recognition"} sizes="(min-width: 1024px) 38vw, (min-width: 640px) 48vw, 100vw" className="h-auto w-full sm:h-[18rem] sm:w-auto lg:h-[16rem]" />
                          <RecognitionCaption item={item} />
                        </figure>
                      </Reveal>
                    ))}
                  </div>
                )}
              </div>
            )}
            {moreGallery.length > 0 && (
              <ul className="mb-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {moreGallery.map((item, i) => (
                  <li key={item.image.publicId || i}>
                    <Reveal delay={Math.min(i, 2) * 0.06}>
                      <figure>
                        <div className="flex aspect-[4/3] items-center justify-center">
                          <Photo
                            media={item.image}
                            alt={item.title ?? "Recognition"}
                            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw"
                            className="h-full w-auto"
                          />
                        </div>
                        <RecognitionCaption item={item} />
                      </figure>
                    </Reveal>
                  </li>
                ))}
              </ul>
            )}

            {/* Text-led archive: every achievement, with or without an image. */}
            {profile.achievements.groups.map((group, g) => {
              const offset = profile.achievements.groups.slice(0, g).reduce((sum, prev) => sum + prev.items.length, 0);
              return (
                <div key={g} className="mt-10 first:mt-0">
                  <h3 className="type-caps flex items-center gap-4 text-rose">
                    {group.heading}
                    <span aria-hidden className="block h-px flex-1 bg-rose/25" />
                  </h3>
                  <ul className="mt-6 grid gap-x-grid gap-y-7 md:grid-cols-2">
                    {group.items.map((a, i) => (
                      <li key={i}>
                        <Reveal y={10} className="flex gap-5">
                          <span className="type-figure text-xl leading-none text-burgundy/70">{num(offset + i + 1)}</span>
                          <div>
                            <h4 className="type-h4 text-foreground">{a.title}</h4>
                            {a.description && <p className="type-small mt-1.5 text-muted">{a.description}</p>}
                          </div>
                        </Reveal>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Growth Through Time: image-led timeline. Desktop alternates around a centre line. ── */}
      {timeline.length > 0 && (
        <section id="milestones" className="pb-section">
          <div className="container-site">
            <div className="section-rule">
              <Reveal>
                <SectionHeading label={page.milestonesLabel} title={page.milestonesHeading} intro={page.milestonesIntro} />
              </Reveal>
              <ol className="relative">
                {/* The chronological line: left on phones, centred from tablet up. */}
                <span aria-hidden className="absolute bottom-2 left-[3px] top-2 w-px bg-burgundy/30 md:left-1/2" />
                {timeline.map((entry, i) => {
                  const vision = entry.kind === "vision";
                  const image = uploaded(entry.image) ? entry.image : undefined;
                  const flip = i % 2 === 1;
                  const text = (
                    <div className={cn(!flip && "md:text-right")}>
                      <p className={cn("type-figure text-[1.5rem] leading-none md:text-[1.75rem]", vision ? "text-rose" : "text-burgundy")}>
                        {entry.year}
                      </p>
                      {vision && <p className="type-label mt-2 text-rose">Vision</p>}
                      <h3 className="type-h4 mt-3 text-foreground">{entry.title}</h3>
                      {entry.description && <p className="type-small mt-2 text-muted">{entry.description}</p>}
                    </div>
                  );
                  return (
                    <li key={entry.id} className="relative pb-12 pl-8 last:pb-0 md:grid md:grid-cols-2 md:gap-16 md:pl-0">
                      <span
                        aria-hidden
                        className={cn(
                          "absolute left-0 top-2 size-[7px] rounded-full md:left-1/2 md:-translate-x-[3px]",
                          vision ? "border border-rose bg-background" : "bg-burgundy",
                        )}
                      />
                      <Reveal y={12} className={cn("md:row-start-1", flip ? "md:col-start-2" : "md:col-start-1")}>
                        {text}
                      </Reveal>
                      {image && (
                        <Reveal
                          y={12}
                          delay={0.06}
                          className={cn("mt-5 flex md:mt-0", flip ? "md:col-start-1 md:row-start-1 md:justify-end" : "md:col-start-2")}
                        >
                          <Photo
                            media={image}
                            alt={entry.title}
                            sizes="(min-width: 768px) 40vw, 90vw"
                            className="h-auto w-full md:h-[20rem] md:w-auto"
                          />
                        </Reveal>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </section>
      )}

      {/* ── Areas of expertise ── */}
      <section id="expertise" className="pb-section">
        <div className="container-site">
          <div className="section-rule">
            <Reveal>
              <SectionHeading label={profile.expertise.subtitle} title={profile.expertise.heading} />
            </Reveal>
            {profile.expertise.intro.length > 0 && (
              <div className="prose-editorial type-body max-w-[46rem] text-foreground/80">
                {profile.expertise.intro.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}
            <ul className="mt-12 grid gap-y-10 md:grid-cols-2 lg:grid-cols-3">
              {profile.expertise.items.map((x, i) => (
                <li key={i} id={x.anchor} className="scroll-mt-28 border-l hairline pl-6 md:pr-6 lg:pl-7">
                  <Reveal y={10} delay={(i % 3) * 0.05}>
                    {x.icon && <Icon name={x.icon} className="size-6 text-burgundy" aria-hidden />}
                    <h3 className="type-h4 mt-4 text-foreground">{x.title}</h3>
                    {x.description && <p className="type-small mt-2 text-foreground/75">{x.description}</p>}
                    {(x.details?.length || x.strengths) && (
                      <details className="group mt-3">
                        <summary className="type-meta inline-flex cursor-pointer list-none items-center gap-2 text-burgundy hover:text-foreground [&::-webkit-details-marker]:hidden">
                          <span className="group-open:hidden">More</span>
                          <span className="hidden group-open:inline">Less</span>
                        </summary>
                        {x.details?.map((d, j) => (
                          <p key={j} className="type-small mt-3 text-muted">
                            {d}
                          </p>
                        ))}
                        {x.strengths && (
                          <p className="type-small mt-3 text-muted">
                            <span className="type-label mr-2 text-rose">Core strengths</span>
                            {x.strengths}
                          </p>
                        )}
                      </details>
                    )}
                  </Reveal>
                </li>
              ))}
            </ul>
            {profile.expertise.distinctiveStrength.heading && (
              <Reveal className="mt-14 border-l-2 border-burgundy pl-6 md:pl-8">
                <h3 className="type-h3 text-foreground">{profile.expertise.distinctiveStrength.heading}</h3>
                <div className="prose-editorial type-body mt-4 max-w-[46rem] text-foreground/80">
                  {profile.expertise.distinctiveStrength.paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* ── Leadership philosophy: photograph with a burgundy quotation panel, text alongside ── */}
      <section id="philosophy" className="pb-section">
        <div className="container-site">
          <div className="section-rule grid items-start gap-14 lg:grid-cols-12 lg:gap-16">
            {philosophyImage && (
              <Reveal className="relative pb-24 lg:col-span-5 lg:pb-28">
                <Photo media={philosophyImage} alt={page.title} sizes="(min-width: 1024px) 38vw, 100vw" className="h-auto w-full" />
                {panelQuote && (
                  <div className="absolute bottom-0 left-6 right-0 bg-burgundy px-7 py-7 text-white sm:left-12 lg:-right-10 lg:left-10">
                    <p className="type-quote text-[clamp(1.125rem,1.5vw,1.375rem)] text-white">{panelQuote}</p>
                    <p className="type-label mt-4 text-white/75">— {page.title}</p>
                  </div>
                )}
              </Reveal>
            )}
            <div className={cn(philosophyImage ? "lg:col-span-7 lg:pl-6" : "lg:col-span-9")}>
              <Reveal>
                <SectionHeading label={page.leadershipLabel} title={profile.philosophy.heading} />
              </Reveal>
              {!philosophyImage && profile.philosophy.subtitle && (
                <p className="type-quote -mt-2 mb-8 text-foreground">{profile.philosophy.subtitle}</p>
              )}
              {philosophyImage && profile.philosophy.quote && profile.philosophy.subtitle && (
                <p className="type-h4 -mt-2 mb-8 text-burgundy">{profile.philosophy.subtitle}</p>
              )}
              <div className="prose-editorial type-body max-w-[42rem] text-foreground/80">
                {profile.philosophy.paragraphs.map((p, i) => (
                  <Reveal key={i} delay={Math.min(i, 3) * 0.05}>
                    <p>{p}</p>
                  </Reveal>
                ))}
              </div>
              <p className="type-label mt-8 text-rose">{page.title}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
