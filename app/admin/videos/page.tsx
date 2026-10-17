"use client";

import { AdminPageHeader } from "@/components/admin/AdminShell";
import { SectionEditor } from "@/components/admin/SectionEditor";
import { VIDEO_FIELDS } from "@/lib/cms/forms";

export default function VideosAdminPage() {
  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Video Gallery"
        description="YouTube videos shown on /videos. Paste the YouTube link — videos are never uploaded. New videos start hidden — switch them on, then publish."
      />
      <SectionEditor
        section="videos"
        title="Videos"
        fields={VIDEO_FIELDS}
        itemLabel="Video"
        summary={(item) => [item.featured ? "★" : "", item.title].filter(Boolean).join(" · ")}
      />
    </div>
  );
}
