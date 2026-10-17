"use client";

import { useId, useMemo, useState } from "react";
import { Play } from "lucide-react";
import type { VideoCategory, VideoItem } from "@/types/content";
import { CarouselNav } from "@/components/ui/CarouselNav";
import { Reveal } from "@/components/ui/Reveal";
import { FilterBar, VideoCard, VideoModal, VideoThumb, formatDate, usePlayer, videoCategoryLabel } from "./VideoPlayer";

const CATEGORIES: { value: VideoCategory; label: string }[] = [
  { value: "talk", label: "Talks" },
  { value: "interview", label: "Interviews" },
  { value: "panel", label: "Panel Discussions" },
  { value: "event", label: "Event Highlights" },
  { value: "short", label: "Shorts" },
];

/** Horizontal, swipeable row of video cards with desktop arrows. */
export function VideoCarousel({ videos, onPlay, title }: { videos: VideoItem[]; onPlay: (v: VideoItem) => void; title: string }) {
  const trackId = `track-${useId().replace(/:/g, "")}`;
  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-6">
        <h2 className="type-h3 text-foreground">{title}</h2>
        <CarouselNav targetId={trackId} className="hidden md:flex" />
      </div>
      <ul id={trackId} className="scroll-track -mx-gutter flex gap-card scroll-px-gutter px-gutter md:mx-0 md:scroll-px-0 md:px-0">
        {videos.map((v) => (
          <li key={v.id} className="w-[82%] shrink-0 sm:w-[46%] lg:w-[calc((100%-2*var(--spacing-card,2rem))/3)]">
            <VideoCard video={v} onPlay={onPlay} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** /videos: featured video, featured carousel, filters and the full grid. */
export function VideoGallery({ videos }: { videos: VideoItem[] }) {
  const { playing, play, close } = usePlayer();
  const [category, setCategory] = useState<VideoCategory | "all">("all");
  const featuredList = videos.filter((v) => v.featured);
  const lead = featuredList[0] ?? videos[0];
  const carousel = featuredList.length > 1 ? featuredList.slice(1) : [];
  const shown = useMemo(() => (category === "all" ? videos : videos.filter((v) => v.category === category)), [videos, category]);
  const available = CATEGORIES.filter((c) => videos.some((v) => v.category === c.value));

  if (!lead) {
    return <p className="type-body text-muted">Videos will appear here once they are published.</p>;
  }

  const leadMeta = [videoCategoryLabel(lead.category), formatDate(lead.date), lead.duration].filter(Boolean).join(" · ");

  return (
    <>
      {/* Featured video — thumbnail until the visitor presses play. */}
      <Reveal className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
        <button
          type="button"
          onClick={() => play(lead)}
          aria-label={`Play video: ${lead.title}`}
          className="group block lg:col-span-7 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-burgundy"
        >
          <VideoThumb video={lead} sizes="(min-width: 1024px) 58vw, 100vw" priority />
        </button>
        <div className="lg:col-span-5">
          <p className="type-label text-rose">Featured</p>
          {leadMeta && <p className="type-meta mt-3 text-muted">{leadMeta}</p>}
          <h2 className="type-h2 mt-3 text-foreground">{lead.title}</h2>
          <span aria-hidden className="mt-5 block h-0.5 w-12 bg-burgundy" />
          {lead.description && <p className="type-body mt-5 text-foreground/85">{lead.description}</p>}
          <button
            type="button"
            onClick={() => play(lead)}
            className="type-button group mt-7 inline-flex h-12 items-center gap-3 bg-burgundy px-7 text-white transition-colors duration-300 hover:bg-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
          >
            <Play className="size-3.5 fill-current" aria-hidden /> Watch Now
          </button>
        </div>
      </Reveal>

      {carousel.length > 0 && (
        <div className="mt-section">
          <VideoCarousel videos={carousel} onPlay={play} title="Featured Videos" />
        </div>
      )}

      <div className="mt-section border-t hairline pt-12">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <h2 className="type-h3 text-foreground">All Videos</h2>
          {available.length > 1 && <FilterBar options={available} value={category} onChange={setCategory} label="Filter videos by category" />}
        </div>
        <ul className="grid gap-x-card gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((v) => (
            <li key={v.id}>
              <VideoCard video={v} onPlay={play} />
            </li>
          ))}
        </ul>
      </div>

      {playing && <VideoModal source={playing} onClose={close} />}
    </>
  );
}
