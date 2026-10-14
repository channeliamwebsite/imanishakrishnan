"use client";

import { useRef, useState } from "react";
import { X } from "lucide-react";
import type { MediaAsset } from "@/types/content";
import { cropComponent, transformCloudinaryUrl, withCloudinaryTransformation } from "@/lib/cloudinary/url";
import { cn } from "@/lib/cn";
import { AdminButton } from "../ui";

/** Crop rectangle as fractions (0–1) of the original image. */
type Rect = { x: number; y: number; w: number; h: number };

const RATIOS = [
  { key: "original", label: "Original", value: null },
  { key: "free", label: "Freeform", value: null },
  { key: "1:1", label: "1:1", value: 1 },
  { key: "4:3", label: "4:3", value: 4 / 3 },
  { key: "3:4", label: "3:4", value: 3 / 4 },
  { key: "16:9", label: "16:9", value: 16 / 9 },
] as const;
type RatioKey = (typeof RATIOS)[number]["key"];

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Largest centred rectangle of the given aspect (width/height, in pixels) inside a W×H image, scaled by `size`. */
function fitRect(aspect: number, W: number, H: number, size = 1): Rect {
  let w = 1;
  let h = (W / aspect) / H;
  if (h > 1) {
    h = 1;
    w = (aspect * H) / W;
  }
  w *= size;
  h *= size;
  return { x: (1 - w) / 2, y: (1 - h) / 2, w, h };
}

/** Recover the stored crop (fractions) from a cropped asset's c_crop component. */
function readCrop(asset: MediaAsset, W: number, H: number): Rect | null {
  const m = asset.url.match(/c_crop,x_(\d+),y_(\d+),w_(\d+),h_(\d+)/);
  if (!m) return null;
  const [x, y, w, h] = m.slice(1).map(Number);
  return { x: x / W, y: y / H, w: w / W, h: h / H };
}

/**
 * Optional, non-destructive crop for a CMS image. The result is the same Cloudinary asset with a
 * c_crop transformation in its URL; the uncropped source is kept in `original`, so "Original"
 * always restores the full image. Cancel leaves the field unchanged.
 */
export function ImageCrop({
  asset,
  onApply,
  onCancel,
}: {
  asset: MediaAsset;
  onApply: (next: MediaAsset) => void;
  onCancel: () => void;
}) {
  const source = asset.original ?? { url: asset.url, width: asset.width, height: asset.height };
  const W = source.width ?? 0;
  const H = source.height ?? 0;
  const existing = asset.original ? readCrop(asset, W, H) : null;

  const [ratio, setRatio] = useState<RatioKey>(existing ? "free" : "original");
  const [rect, setRect] = useState<Rect>(existing ?? { x: 0, y: 0, w: 1, h: 1 });
  const [size, setSize] = useState(1);
  const stage = useRef<HTMLDivElement>(null);
  const drag = useRef<{ px: number; py: number; start: Rect } | null>(null);

  const ratioValue = RATIOS.find((r) => r.key === ratio)?.value ?? null;
  const cropping = ratio !== "original";

  const chooseRatio = (key: RatioKey) => {
    setRatio(key);
    setSize(1);
    const value = RATIOS.find((r) => r.key === key)?.value;
    if (key === "original") setRect({ x: 0, y: 0, w: 1, h: 1 });
    else if (value) setRect(fitRect(value, W, H));
    else setRect((r) => (r.w === 1 && r.h === 1 ? { x: 0.1, y: 0.1, w: 0.8, h: 0.8 } : r));
  };

  /** Resize around the current centre, keeping the rectangle inside the image. */
  const resize = (w: number, h: number) =>
    setRect((r) => {
      const cx = r.x + r.w / 2;
      const cy = r.y + r.h / 2;
      return { w, h, x: clamp(cx - w / 2, 0, 1 - w), y: clamp(cy - h / 2, 0, 1 - h) };
    });

  const move = (dx: number, dy: number, from: Rect = rect) =>
    setRect({ ...from, x: clamp(from.x + dx, 0, 1 - from.w), y: clamp(from.y + dy, 0, 1 - from.h) });

  const onPointerDown = (e: React.PointerEvent) => {
    if (!cropping) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { px: e.clientX, py: e.clientY, start: rect };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const box = stage.current?.getBoundingClientRect();
    if (!d || !box) return;
    move((e.clientX - d.px) / box.width, (e.clientY - d.py) / box.height, d.start);
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 0.05 : 0.01;
    const keys: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    if (keys[e.key]) {
      e.preventDefault();
      move(...keys[e.key]);
    }
  };

  const apply = () => {
    if (!cropping) {
      // Back to the full original image (removes any earlier crop).
      onApply({ ...asset, url: source.url, width: W, height: H, original: undefined });
      return;
    }
    const px = { x: rect.x * W, y: rect.y * H, width: rect.w * W, height: rect.h * H };
    onApply({
      ...asset,
      url: withCloudinaryTransformation(source.url, cropComponent(px)),
      width: Math.round(px.width),
      height: Math.round(px.height),
      original: { url: source.url, width: W, height: H },
    });
  };

  const display = transformCloudinaryUrl(source.url, { width: 1200, crop: "limit" });
  const resultAspect = cropping ? (rect.w * W) / (rect.h * H) : W / H;

  return (
    <div role="dialog" aria-modal="true" aria-label="Crop image" className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="font-sans text-lg font-semibold">Crop image</h2>
          <button type="button" onClick={onCancel} aria-label="Cancel">
            <X className="size-5" />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto p-5 md:grid-cols-[1fr_16rem]">
          {/* Original with the crop rectangle */}
          <div className="flex min-w-0 items-center justify-center rounded bg-[repeating-conic-gradient(#eee_0%_25%,#fff_0%_50%)] bg-[length:16px_16px] p-2">
            <div ref={stage} className="relative max-h-[60vh] select-none" style={{ aspectRatio: `${W}/${H}`, width: `min(100%, calc(60vh * ${W / H}))` }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- admin editor, resized by Cloudinary */}
              <img src={display} alt="" draggable={false} className="absolute inset-0 size-full" />
              {cropping && (
                <div
                  role="slider"
                  tabIndex={0}
                  aria-label="Crop position — use the arrow keys to move"
                  aria-valuenow={Math.round(rect.x * 100)}
                  aria-valuetext={`${Math.round(rect.x * 100)}% from left, ${Math.round(rect.y * 100)}% from top`}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={() => (drag.current = null)}
                  onKeyDown={onKeyDown}
                  className="absolute cursor-move border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] outline-none focus-visible:border-burgundy"
                  style={{ left: `${rect.x * 100}%`, top: `${rect.y * 100}%`, width: `${rect.w * 100}%`, height: `${rect.h * 100}%` }}
                />
              )}
            </div>
          </div>

          {/* Controls and result preview */}
          <div className="space-y-5 font-sans text-sm">
            <fieldset>
              <legend className="mb-2 font-semibold">Ratio</legend>
              <div className="flex flex-wrap gap-1.5">
                {RATIOS.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    aria-pressed={ratio === r.key}
                    onClick={() => chooseRatio(r.key)}
                    className={cn(
                      "rounded border px-2.5 py-1",
                      ratio === r.key ? "border-burgundy bg-burgundy text-white" : "border-border hover:border-burgundy",
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </fieldset>

            {cropping && ratioValue && (
              <label className="block">
                <span className="font-semibold">Size</span>
                <input
                  type="range"
                  min={20}
                  max={100}
                  value={Math.round(size * 100)}
                  onChange={(e) => {
                    const s = Number(e.target.value) / 100;
                    setSize(s);
                    const full = fitRect(ratioValue, W, H);
                    resize(full.w * s, full.h * s);
                  }}
                  className="mt-1 w-full accent-[var(--burgundy)]"
                />
              </label>
            )}
            {ratio === "free" && (
              <>
                <label className="block">
                  <span className="font-semibold">Width</span>
                  <input type="range" min={10} max={100} value={Math.round(rect.w * 100)} onChange={(e) => resize(Number(e.target.value) / 100, rect.h)} className="mt-1 w-full accent-[var(--burgundy)]" />
                </label>
                <label className="block">
                  <span className="font-semibold">Height</span>
                  <input type="range" min={10} max={100} value={Math.round(rect.h * 100)} onChange={(e) => resize(rect.w, Number(e.target.value) / 100)} className="mt-1 w-full accent-[var(--burgundy)]" />
                </label>
              </>
            )}
            {cropping && <p className="text-xs text-muted">Drag the box (or use the arrow keys) to position the crop.</p>}

            <div>
              <p className="mb-2 font-semibold">Result</p>
              <div className="relative w-full overflow-hidden rounded border border-border bg-[repeating-conic-gradient(#eee_0%_25%,#fff_0%_50%)] bg-[length:12px_12px]" style={{ aspectRatio: `${resultAspect}` }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of the crop */}
                <img
                  src={display}
                  alt=""
                  className="absolute max-w-none"
                  style={{
                    width: `${100 / rect.w}%`,
                    height: `${100 / rect.h}%`,
                    left: `${(-rect.x / rect.w) * 100}%`,
                    top: `${(-rect.y / rect.h) * 100}%`,
                  }}
                />
              </div>
              <p className="mt-1.5 text-xs text-muted">
                {cropping ? `${Math.round(rect.w * W)} × ${Math.round(rect.h * H)} px` : `Full image, ${W} × ${H} px (no crop)`}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-5 py-3">
          <AdminButton variant="ghost" onClick={onCancel}>
            Cancel
          </AdminButton>
          <AdminButton variant="primary" onClick={apply}>
            {cropping ? "Apply crop" : "Use full image"}
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
