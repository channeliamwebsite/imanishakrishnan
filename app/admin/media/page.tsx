"use client";

import { AdminPageHeader } from "@/components/admin/AdminShell";
import { SectionEditor } from "@/components/admin/SectionEditor";
import { MEDIA_COPY_FIELDS, MEDIA_FIELDS } from "@/lib/cms/forms";

export default function MediaAdminPage() {
  return (
    <div className="space-y-10">
      <AdminPageHeader title="Media mentions" description="Publications shown in the In the Media strip." />
      <SectionEditor
        section="mediaFeatures"
        title="Publications"
        fields={MEDIA_FIELDS}
        itemLabel="Publication"
        summary={(item) => String(item.publication ?? "")}
        preview="media"
      />
      <SectionEditor
        section="siteSettings"
        path={["sections", "media"]}
        title="Section heading"
        fields={MEDIA_COPY_FIELDS}
        preview="settings-media"
        sharedNote="Section headings are part of Site settings: this also publishes saved changes made on the Settings, Work and Insights pages."
      />
    </div>
  );
}
