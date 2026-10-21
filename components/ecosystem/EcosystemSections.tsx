"use client";

import { useCallback, useMemo, useState } from "react";
import NextImage from "next/image";
import { ArrowRight, ExternalLink, Images } from "lucide-react";
import type { EcosystemEvent, MediaAsset, VideoItem } from "@/types/content";
import { isCloudinaryUrl } from "@/lib/cloudinary/url";
import { Lightbox } from "@/components/testimonials/TestimonialGallery";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FilterBar, VideoCard, VideoModal, formatDate, usePlayer } from "@/components/video/VideoPlayer";
import { VideoCarousel } from "@/components/video/VideoGallery";

/** Events shown before "Show more events". */
const EVENTS_PAGE = 9;

const photosOf = (e: EcosystemEvent) => e.images.filter((m) => m.url && isCloudinaryUrl(m.url));

/**
 * /ecosystem-enabler below the hero, from published CMS records only (Admin → Ecosystem Enabler &
 * events): the event photography gallery first, then Featured Conversations (featured videos) and
 * Conversations That Matter (other videos). Sections without records are omitted.
 *
 * The gallery is grouped by event: each event shows its cover photograph at its natural proportions
 * in a masonry layout (featured events first), with only the details the editor filled in; clicking
 * opens every photograph of that event in the shared lightbox.
 */
export function EcosystemSections({ events, videos }: { events: EcosystemEvent[]; videos: VideoItem[] }) {
  const { playing, play, close } = usePlayer();
  const [gallery, setGallery] = useState<{ images: MediaAsset[]; index: number } | null>(null);
  const [category, setCategory] = useState<string | "all">("all");
  const [shown, setShown] = useState(EVENTS_PAGE);
  const closeGallery = useCallback(() => setGallery(null), []);

  // Events with photographs, featured first (otherwise in the CMS order).
  const withPhotos = useMemo(
    () => events.filter((e) => photosOf(e).length > 0).sort((a, b) => Number(b.featured) - Number(a.featured)),
    [events],
  );
  const categories = useMemo(
    () => [...new Set(withPhotos.map((e) => e.category.trim()).filter(Boolean))].map((c) => ({ value: c, label: c })),
    [withPhotos],
  );
  const filtered = category === "all" ? withPhotos : withPhotos.filter((e) => e.category.trim() === category);
  const visible = filtered.slice(0, shown);

  const featured = videos.filter((v) => v.featured);
  const conversations = featured.length ? videos.filter((v) => !v.featured) : videos;

  return (
    <>
      {withPhotos.length > 0 && (
        <section id="engagements" className="pb-section">
          <div className="container-site section-rule">
            <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <Reveal>
                <SectionHeading label="Events & Gatherings" title="Moments from the Ecosystem" />
              </Reveal>
              {categories.length > 1 && (
                <FilterBar
                  options={categories}
                  value={category}
                  onChange={(v) => {
                    setCategory(v);
                    setShown(EVENTS_PAGE);
                  }}
                  label="Filter events by category"
                />
              )}
            </div>

            <ul className="gap-x-8 sm:columns-2 lg:columns-3">
              {visible.map((e, i) => {
                const photos = photosOf(e).map((m, j, all) => ({
                  ...m,
                  alt: m.alt || (all.length > 1 ? `${e.name} — photograph ${j + 1}` : e.name),
                  caption: m.caption || e.name,
                }));
                const cover = photos[0];
                const meta = [e.summit, e.location, formatDate(e.date)].filter(Boolean).join(" · ");
                return (
                  <li key={e.id} className="mb-12 break-inside-avoid">
                    <Reveal delay={Math.min(i % 3, 2) * 0.05}>
                      <article>
                        <button
                          type="button"
                          onClick={() => setGallery({ images: photos, index: 0 })}
                          aria-label={`View photographs: ${e.name}`}
                          className="group relative block w-full overflow-hidden bg-foreground/[0.05] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-burgundy"
                        >
                          <NextImage
                            src={cover.url}
                            alt={cover.alt!}
                            width={cover.width ?? 1200}
                            height={cover.height ?? 900}
                            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw"
                            className="h-auto w-full transition-transform duration-700 ease-editorial motion-safe:group-hover:scale-[1.03]"
                          />
                          {photos.length > 1 && (
                            <span className="type-meta absolute bottom-3 right-3 inline-flex items-center gap-1.5 bg-background/90 px-2.5 py-1 text-foreground">
                              <Images className="size-3.5" aria-hidden /> {photos.length}
                            </span>
                          )}
                        </button>
                        <div className="mt-4">
                          {(e.category || e.role) && (
                            <p className="type-meta text-rose">{[e.category, e.role].filter(Boolean).join(" · ")}</p>
                          )}
                          <h3 className="type-h4 mt-1 text-foreground">{e.name}</h3>
                          {meta && <p className="type-meta mt-1 text-muted">{meta}</p>}
                          {e.description && <p className="type-small mt-2 line-clamp-3 text-foreground/75">{e.description}</p>}
                          {e.url && (
                            <a
                              href={e.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="type-button mt-3 inline-flex items-center gap-2 text-burgundy hover:text-foreground"
                            >
                              Event Website <ExternalLink className="size-3.5" aria-hidden />
                            </a>
                          )}
                        </div>
                      </article>
                    </Reveal>
                  </li>
                );
              })}
            </ul>

            {filtered.length > shown && (
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShown((n) => n + EVENTS_PAGE)}
                  className="type-button group inline-flex h-12 items-center gap-3 border border-burgundy bg-background px-7 text-burgundy transition-colors duration-300 hover:bg-burgundy hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
                >
                  Show more events
                  <ArrowRight className="size-3.5 transition-transform duration-300 motion-safe:group-hover:translate-x-1" aria-hidden />
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="pb-section">
          <div className="container-site section-rule">
            <VideoCarousel videos={featured} onPlay={play} title="Featured Conversations" />
          </div>
        </section>
      )}

      {conversations.length > 0 && (
        <section id="conversations" className="pb-section">
          <div className="container-site section-rule">
            <Reveal>
              <SectionHeading label="Panels · Interviews · Sessions" title="Conversations That Matter" />
            </Reveal>
            <ul className="grid gap-x-card gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {conversations.map((v) => (
                <li key={v.id}>
                  <VideoCard video={v} onPlay={play} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {playing && <VideoModal source={playing} onClose={close} />}
      {gallery && (
        <Lightbox images={gallery.images} index={gallery.index} onIndex={(index) => setGallery({ ...gallery, index })} onClose={closeGallery} />
      )}
    </>
  );
}
