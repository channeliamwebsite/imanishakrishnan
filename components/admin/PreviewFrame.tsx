"use client";

import { useEffect, useRef, useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
import { cn } from "@/lib/cn";
import type { PreviewKind } from "./previews";

/**
 * Shows a preview in an iframe (app/preview) at a real device width, scaled to fit the panel, so
 * the public components' breakpoints behave exactly as on the live site. The draft is passed by
 * postMessage — same origin only — and is never stored or sent to the server.
 */

const DEVICES = {
  desktop: { width: 1280, height: 800, label: "Desktop", Icon: Monitor },
  mobile: { width: 390, height: 844, label: "Mobile", Icon: Smartphone },
} as const;

export function PreviewFrame({ kind, data }: { kind: PreviewKind; data: unknown }) {
  const [device, setDevice] = useState<keyof typeof DEVICES>("desktop");
  const [ready, setReady] = useState(false);
  const [available, setAvailable] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const { width, height } = DEVICES[device];
  const scale = available ? Math.min(1, available / width) : 1;

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setAvailable(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== frame.current?.contentWindow) return;
      if (e.data?.type === "preview-ready") setReady(true);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (ready) frame.current?.contentWindow?.postMessage({ type: "preview-render", kind, data }, window.location.origin);
  }, [ready, kind, data, device]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1" role="group" aria-label="Preview size">
        {(Object.keys(DEVICES) as (keyof typeof DEVICES)[]).map((key) => {
          const { label, Icon } = DEVICES[key];
          return (
            <button
              key={key}
              type="button"
              aria-pressed={device === key}
              onClick={() => {
                setReady(false);
                setDevice(key);
              }}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-md px-3 font-sans text-sm font-semibold",
                device === key ? "bg-foreground text-white" : "text-foreground/70 hover:bg-foreground/5",
              )}
            >
              <Icon className="size-3.5" aria-hidden /> {label}
            </button>
          );
        })}
        <span className="ml-2 font-sans text-xs text-muted">
          {width}px{scale < 1 ? ` · shown at ${Math.round(scale * 100)}%` : ""} · scroll inside the preview
        </span>
      </div>
      <div ref={wrap} className="w-full">
        <div className="mx-auto overflow-hidden rounded-md border border-border bg-background" style={{ width: width * scale, height: height * scale }}>
          <iframe
            key={device}
            ref={frame}
            src="/preview"
            title={`${DEVICES[device].label} preview`}
            className="origin-top-left border-0"
            style={{ width, height, transform: `scale(${scale})` }}
          />
        </div>
      </div>
    </div>
  );
}
