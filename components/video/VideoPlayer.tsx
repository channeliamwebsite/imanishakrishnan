"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import NextImage from "next/image";
import { Play, X } from "lucide-react";
import type { VideoItem } from "@/types/content";
import { cn } from "@/lib/cn";
import { parseYouTubeId, youTubeEmbedUrl, youTubeThumbnail } from "@/lib/youtube";

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
export const formatDate = (iso?: string) => (iso && !Number.isNaN(Date.parse(iso)) ? dateFormat.format(new Date(iso)) : undefined);

const VIDEO_CATEGORY_LABELS: Record<VideoItem["category"], string> = {
  talk: "Talk",
  interview: "Interview",
  panel: "Panel Discussion",
  event: "Event Highlight",
  short: "Short",
};
export const videoCategoryLabel = (c: VideoItem["category"]) => VIDEO_CATEGORY_LABELS[c] ?? c;

export type PlayableSource = { title: string; youtubeId?: string; fileUrl?: string; poster?: string };

/**
 * Full-screen video player. The YouTube iframe (privacy-enhanced domain) or HTML5 video is created
 * only when the modal opens, after the visitor clicked play — and removed on close, which stops
 * playback. Escape closes; focus moves to the close button and returns to the opener.
 */
export function VideoModal({ source, onClose }: { source: PlayableSource; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={source.title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/95 p-4 sm:p-8"
      onClick={onClose}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close video"
        className="absolute right-3 top-3 grid size-11 place-items-center text-white/85 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-white sm:right-6 sm:top-6"
      >
        <X className="size-6" aria-hidden />
      </button>
      <div className="w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
        <div className="relative aspect-video w-full bg-black">
          {source.youtubeId ? (
            <iframe
              src={youTubeEmbedUrl(source.youtubeId)}
              title={source.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="absolute inset-0 size-full"
            />
          ) : source.fileUrl ? (
            <video src={source.fileUrl} poster={source.poster} controls autoPlay playsInline className="absolute inset-0 size-full">
              <track kind="captions" />
            </video>
          ) : null}
        </div>
        <p className="type-h4 mt-4 text-white">{source.title}</p>
      </div>
    </div>
  );
}

/** A direct video file or a YouTube link → what the modal plays. */
export function toPlayable(title: string, url: string, poster?: string): PlayableSource {
  const youtubeId = parseYouTubeId(url) ?? undefined;
  return youtubeId ? { title, youtubeId } : { title, fileUrl: url, poster };
}

/** The thumbnail of a video: the uploaded one, else YouTube's. Never an iframe. */
export function VideoThumb({ video, sizes, priority, className }: { video: VideoItem; sizes: string; priority?: boolean; className?: string }) {
  return (
    <div className={cn("relative aspect-video w-full overflow-hidden bg-foreground/10", className)}>
      {video.thumbnail ? (
        <NextImage
          src={video.thumbnail.url}
          alt=""
          fill
          sizes={sizes}
          preload={priority}
          className="object-cover transition-transform duration-500 ease-editorial motion-safe:group-hover:scale-[1.03]"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- YouTube's own thumbnail (not a Cloudinary asset)
        <img
          src={youTubeThumbnail(video.videoId)}
          alt=""
          loading={priority ? "eager" : "lazy"}
          className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-editorial motion-safe:group-hover:scale-[1.03]"
        />
      )}
      <span aria-hidden className="absolute inset-0 grid place-items-center bg-foreground/10 transition-colors group-hover:bg-foreground/25">
        <span className="grid size-14 place-items-center rounded-full bg-background/90 text-burgundy shadow-sm transition-transform duration-300 motion-safe:group-hover:scale-105">
          <Play className="size-4 translate-x-px fill-current" />
        </span>
      </span>
    </div>
  );
}

/** Thumbnail card; clicking calls onPlay (the page opens the modal). */
export function VideoCard({ video, onPlay, className }: { video: VideoItem; onPlay: (v: VideoItem) => void; className?: string }) {
  const meta = [videoCategoryLabel(video.category), formatDate(video.date), video.duration].filter(Boolean).join(" · ");
  return (
    <button
      type="button"
      onClick={() => onPlay(video)}
      aria-label={`Play video: ${video.title}`}
      className={cn("group block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-burgundy", className)}
    >
      <VideoThumb video={video} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw" />
      <p className="type-meta mt-4 text-rose">{meta}</p>
      <p className="type-h4 mt-1.5 text-foreground transition-colors group-hover:text-burgundy">{video.title}</p>
    </button>
  );
}

/** Category filter buttons (All + the given options). */
export function FilterBar<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T | "all";
  onChange: (v: T | "all") => void;
  label: string;
}) {
  const all = [{ value: "all" as const, label: "All" }, ...options];
  return (
    <div role="group" aria-label={label} className="-mx-gutter flex gap-2 overflow-x-auto px-gutter pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      {all.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "type-caps h-10 shrink-0 whitespace-nowrap border px-4 text-[0.75rem] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy",
            value === o.value ? "border-burgundy bg-burgundy text-white" : "border-foreground/20 text-foreground/80 hover:border-burgundy hover:text-burgundy",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Hook: one open player at a time. */
export function usePlayer() {
  const [playing, setPlaying] = useState<PlayableSource | null>(null);
  const play = useCallback((v: VideoItem) => setPlaying({ title: v.title, youtubeId: v.videoId }), []);
  const close = useCallback(() => setPlaying(null), []);
  return { playing, play, setPlaying, close };
}
