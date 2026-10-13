"use client";

import { useEffect, useState } from "react";
import { PreviewRenderer, type PreviewKind } from "@/components/admin/previews";

/**
 * Admin preview viewport, loaded in an iframe by components/admin/PreviewFrame.tsx. It renders
 * whatever draft the admin page (same origin only) posts to it; on its own it shows nothing.
 */
export default function PreviewPage() {
  const [preview, setPreview] = useState<{ kind: PreviewKind; data: unknown } | null>(null);

  useEffect(() => {
    if (window.parent === window) return;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== window.parent) return;
      if (e.data?.type === "preview-render") setPreview({ kind: e.data.kind, data: e.data.data });
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: "preview-ready" }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (!preview) return <p className="p-6 font-sans text-sm text-muted">Previews open from the admin dashboard.</p>;
  return <PreviewRenderer kind={preview.kind} data={preview.data} />;
}
