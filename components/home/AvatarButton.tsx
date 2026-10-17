"use client";

import { useCallback, useState } from "react";
import { Play } from "lucide-react";
import type { AvatarVideo } from "@/types/content";
import { VideoModal, toPlayable } from "@/components/video/VideoPlayer";

/**
 * "Meet My Avatar" — beside the hero's main button, styled like the hero's play link. Rendered
 * only when the avatar video is enabled with a URL (CMS: Avatar Video). Nothing loads until click;
 * closing the modal removes the player, which stops playback.
 */
export function AvatarButton({ avatar }: { avatar: AvatarVideo }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="type-button group inline-flex items-center gap-4 text-[0.6875rem] text-muted transition-colors duration-300 ease-editorial hover:text-burgundy focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-burgundy"
      >
        <span className="grid size-14 place-items-center rounded-full border border-rose/50 text-foreground transition-colors group-hover:border-burgundy">
          <Play className="size-3 translate-x-px fill-current" aria-hidden />
        </span>
        {avatar.label}
      </button>
      {open && avatar.url && <VideoModal source={toPlayable(avatar.title || avatar.label, avatar.url, avatar.poster?.url)} onClose={close} />}
    </>
  );
}
