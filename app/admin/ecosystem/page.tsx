"use client";

import { AdminPageHeader } from "@/components/admin/AdminShell";
import { SectionEditor } from "@/components/admin/SectionEditor";
import { ECOSYSTEM_EVENT_FIELDS, ECOSYSTEM_PAGE_FIELDS, VIDEO_FIELDS } from "@/lib/cms/forms";

export default function EcosystemAdminPage() {
  return (
    <div className="space-y-10">
      <AdminPageHeader
        title="Ecosystem Enabler"
        description="The /ecosystem-enabler page: introduction, events (Summits & Gatherings) and conversations (YouTube videos). Featured videos appear in Featured Conversations."
      />
      <SectionEditor section="ecosystem" title="Page text & images" fields={ECOSYSTEM_PAGE_FIELDS} />
      <SectionEditor
        section="ecosystemEvents"
        title="Events"
        fields={ECOSYSTEM_EVENT_FIELDS}
        itemLabel="Event"
        summary={(item) => [item.featured ? "★" : "", item.date, item.name].filter(Boolean).join(" · ")}
      />
      <SectionEditor
        section="ecosystemVideos"
        title="Conversations & videos"
        fields={VIDEO_FIELDS}
        itemLabel="Video"
        summary={(item) => [item.featured ? "★" : "", item.title].filter(Boolean).join(" · ")}
      />
    </div>
  );
}
