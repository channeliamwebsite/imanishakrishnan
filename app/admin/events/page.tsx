"use client";

import { AdminPageHeader } from "@/components/admin/AdminShell";
import { SectionEditor } from "@/components/admin/SectionEditor";
import { Notice } from "@/components/admin/ui";
import { EVENT_FIELDS } from "@/lib/cms/forms";

export default function EventsAdminPage() {
  return (
    <div className="space-y-4">
      <AdminPageHeader title="Events" description="Speaking engagements and events." />
      <Notice tone="info">
        Events can be stored and published here, but the public website has no events section yet. Adding one is a
        design decision; until then, published events are not shown to visitors.
      </Notice>
      <SectionEditor
        section="speaking"
        title="Events"
        fields={EVENT_FIELDS}
        itemLabel="Event"
        summary={(item) => [item.date, item.title].filter(Boolean).join(" · ")}
      />
    </div>
  );
}
