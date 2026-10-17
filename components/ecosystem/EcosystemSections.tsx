"use client";

import { useCallback, useState } from "react";
import NextImage from "next/image";
import { ArrowRight, ExternalLink } from "lucide-react";
import type { EcosystemEvent, MediaAsset, VideoItem } from "@/types/content";
import { Lightbox } from "@/components/testimonials/TestimonialGallery";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VideoCard, VideoModal, formatDate, usePlayer } from "@/components/video/VideoPlayer";
import { VideoCarousel } from "@/components/video/VideoGallery";

const EVENTS_INITIAL = 6;

/**
 * /ecosystem-enabler sections B–D, from published CMS records only: Featured Conversations
 * (featured videos), Summits & Gatherings (events) and Conversations That Matter (other videos).
 * Sections without records are omitted.
 */
export function EcosystemSections({ events, videos }: { events: EcosystemEvent[]; videos: VideoItem[] }) {
  const { playing, play, close } = usePlayer();
  const [gallery, setGallery] = useState<{ images: MediaAsset[]; index: number } | null>(null);
  const [allEvents, setAllEvents] = useState(false);
  const closeGallery = useCallback(() => setGallery(null), []);

  const featured = videos.filter((v) => v.featured);
  const conversations = featured.length ? videos.filter((v) => !v.featured) : videos;
  const shownEvents = allEvents ? events : events.slice(0, EVENTS_INITIAL);

  return (
    <>
      {featured.length > 0 && (
        <section className="pb-section">
          <div className="container-site section-rule">
            <VideoCarousel videos={featured} onPlay={play} title="Featured Conversations" />
          </div>
        </section>
      )}

      {events.length > 0 && (
        <section id="summits" className="pb-section">
          <div className="container-site section-rule">
            <Reveal>
              <SectionHeading label="Events" title="Summits & Gatherings" />
            </Reveal>
            <ul className="grid gap-x-card gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {shownEvents.map((e) => {
                const cover = e.images[0];
                const where = [e.location, formatDate(e.date)].filter(Boolean).join(" · ");
                const images = e.images.map((m, i) => ({ ...m, alt: m.alt || `${e.name} — photograph ${i + 1}` }));
                return (
                  <li key={e.id}>
                    <article>
                      <button
                        type="button"
                        onClick={() => setGallery({ images, index: 0 })}
                        aria-label={`View photographs: ${e.name}`}
                        className="group relative block aspect-[4/3] w-full overflow-hidden bg-foreground/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-burgundy"
                      >
                        <NextImage
                          src={cover.url}
                          alt={images[0].alt ?? e.name}
                          fill
                          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw"
                          className="object-cover transition-transform duration-500 ease-editorial motion-safe:group-hover:scale-[1.03]"
                        />
                        {e.images.length > 1 && (
                          <span className="type-meta absolute bottom-3 right-3 bg-background/90 px-2 py-1 text-foreground">{e.images.length} photos</span>
                        )}
                      </button>
                      {(e.category || e.role) && <p className="type-meta mt-4 text-rose">{[e.category, e.role].filter(Boolean).join(" · ")}</p>}
                      <h3 className="type-h4 mt-1.5 text-foreground">{e.name}</h3>
                      {e.summit && <p className="type-small mt-1 text-foreground/80">{e.summit}</p>}
                      {where && <p className="type-meta mt-1 text-muted">{where}</p>}
                      {e.description && <p className="type-small mt-3 text-muted">{e.description}</p>}
                      {e.url && (
                        <a href={e.url} target="_blank" rel="noopener noreferrer" className="type-button mt-3 inline-flex items-center gap-2 text-burgundy hover:text-foreground">
                          Event Website <ExternalLink className="size-3.5" aria-hidden />
                        </a>
                      )}
                    </article>
                  </li>
                );
              })}
            </ul>
            {!allEvents && events.length > EVENTS_INITIAL && (
              <div className="mt-12 flex">
                <button
                  type="button"
                  onClick={() => setAllEvents(true)}
                  className="type-button group inline-flex h-12 items-center gap-3 border border-burgundy bg-background px-7 text-burgundy transition-colors duration-300 hover:bg-burgundy hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
                >
                  View All
                  <ArrowRight className="size-3.5 transition-transform duration-300 motion-safe:group-hover:translate-x-1" aria-hidden />
                </button>
              </div>
            )}
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
