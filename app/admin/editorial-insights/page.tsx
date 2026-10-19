"use client";

import { AdminPageHeader } from "@/components/admin/AdminShell";
import { SectionEditor } from "@/components/admin/SectionEditor";
import { EDITORIAL_VIDEO_FIELDS } from "@/lib/cms/forms";

export default function EditorialInsightsAdminPage() {
  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Editorial Insights"
        description="YouTube editorials, commentary and interviews shown on /editorial-insights. Paste the YouTube link — videos are never uploaded. The first featured video is shown large."
      />
      <SectionEditor
        section="editorialVideos"
        title="Videos"
        fields={EDITORIAL_VIDEO_FIELDS}
        itemLabel="Video"
        summary={(item) => [item.featured ? "★" : "", item.title].filter(Boolean).join(" · ")}
      />
    </div>
  );
}
