"use client";

import { AdminPageHeader } from "@/components/admin/AdminShell";
import { SectionEditor } from "@/components/admin/SectionEditor";
import { TIMELINE_FIELDS } from "@/lib/cms/forms";

export default function TimelineAdminPage() {
  return (
    <>
      <AdminPageHeader
        title="Timeline"
        description="Career milestones, shown in the homepage About section and on the /about page."
      />
      <SectionEditor
        section="timeline"
        title="Milestones"
        fields={TIMELINE_FIELDS}
        itemLabel="Milestone"
        summary={(item) => [item.year, item.title].filter(Boolean).join(" · ")}
        preview="timeline"
      />
    </>
  );
}
